#!/usr/bin/env python3
"""
从B站Wiki批量提取所有赛马娘技能数据
"""

import json
import re
import time
import html as html_module
import urllib.request
import urllib.parse

# Load character list
with open('/tmp/characters.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

all_results = []
failed = []

def extract_skills(html_text):
    """Extract all skills from HTML"""
    # Decode HTML entities
    decoded = html_module.unescape(html_text)
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', decoded)
    # Clean whitespace
    text = re.sub(r'\s+', ' ', text)

    skills = []

    # Find all skill sections
    # Pattern: 稀有度 ： X 条件限制 ： X 技能描述 ： X ...
    skill_pattern = r'稀有度\s*：\s*([^\s]+).*?条件限制\s*：\s*([^\s]+).*?技能描述\s*：\s*([^中文]+?)\s*中文描述\s*：\s*([^前置]+?)\s*前置代码.*?触发代码\s*：\s*([^\s]+).*?触发条件\s*：\s*([^技能]+?)\s*技能类型\s*：\s*([^\s]+).*?技能数值\s*：\s*([^\s]+).*?持续时间\s*：\s*([^\s]+)'

    matches = re.finditer(skill_pattern, text, re.DOTALL)
    for m in matches:
        skill = {
            'rarity': m.group(1).strip(),
            'restriction': m.group(2).strip(),
            'desc_jp': m.group(3).strip(),
            'desc_zh': m.group(4).strip(),
            'trigger_code': m.group(5).strip(),
            'trigger': m.group(6).strip(),
            'skill_type': m.group(7).strip(),
            'value': m.group(8).strip(),
            'duration': m.group(9).strip(),
        }
        skills.append(skill)

    return skills


def fetch_and_extract(char_name_zh, card_id):
    """Fetch page and extract skills"""
    url = f"https://wiki.biligame.com/umamusume/api.php?action=parse&page={urllib.parse.quote(char_name_zh)}&prop=text&format=json"

    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read().decode('utf-8'))

        if 'parse' not in result:
            return None

        html = result['parse']['text']['*']
        decoded = html_module.unescape(html)
        text = re.sub(r'<[^>]+>', ' ', decoded)
        text = re.sub(r'\s+', ' ', text)

        # Find unique skill name
        unique_name = None
        idx = text.find('固有技能')
        if idx >= 0:
            section = text[idx:idx+500]
            # Look for name pattern: JP_name / CN_name
            m = re.search(r'固有技能\s+([^/]+)/([^\s]+)', section)
            if m:
                unique_name = {'jp': m.group(1).strip(), 'zh': m.group(2).strip()}

        # Find inherit skill
        inherit_name = None
        idx = text.find('继承于')  # May not exist
        if idx < 0:
            idx = text.find('普通·继承')
        if idx >= 0:
            section = text[idx:idx+500]
            m = re.search(r'([^/]+)/([^\s]+)', section)
            if m:
                inherit_name = {'jp': m.group(1).strip(), 'zh': m.group(2).strip()}

        # Extract skill details using structured parsing
        skills = extract_skills(html)

        return {
            'card_id': card_id,
            'name_zh': char_name_zh,
            'unique_name': unique_name,
            'inherit_name': inherit_name,
            'skills_found': len(skills),
            'skills': skills[:3],  # First 3 skills (unique + initial)
        }

    except Exception as e:
        return {'error': str(e), 'card_id': card_id, 'name': char_name_zh}


# Process all characters
print(f"Processing {sum(len(c['variants']) for c in data['characters'])} variants...")
for char in data['characters']:
    name_zh = char['name_zh']
    for variant in char['variants']:
        card_id = variant['card_id']
        result = fetch_and_extract(name_zh, card_id)

        if result and 'error' not in result:
            all_results.append(result)
            u = result.get('unique_name', {})
            i = result.get('inherit_name')
            u_str = f"{u.get('jp', '?')}" if u else "?"
            i_str = f"{i.get('jp', '?')}" if i else "-"
            print(f"  {name_zh} ({card_id}): U={u_str}, I={i_str}, skills={result['skills_found']}")
        else:
            failed.append(result)
            print(f"  {name_zh} ({card_id}): FAIL")

        time.sleep(0.3)

# Save
with open('/tmp/all_skills_raw.json', 'w', encoding='utf-8') as f:
    json.dump(all_results, f, ensure_ascii=False, indent=2)

print(f"\nDone! Success: {len(all_results)}, Failed: {len(failed)}")
print("Saved to /tmp/all_skills_raw.json")
