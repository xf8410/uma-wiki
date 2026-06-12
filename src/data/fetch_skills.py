#!/usr/bin/env python3
"""
从B站Wiki批量获取赛马娘固有技能数据
只获取日服数据
"""

import json
import re
import time
import urllib.request
import urllib.parse

with open('/tmp/characters.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

results = []
failed = []

def fetch_skill(char_name_zh, char_name_ja, card_id, avatar):
    """Fetch skill data for a character from Bilibili Wiki"""
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

        # Extract unique skill
        unique = extract_unique_skill(html)
        # Extract inherit skill
        inherit = extract_inherit_skill(html)

        return {
            'card_id': card_id,
            'char_name_zh': char_name_zh,
            'char_name_ja': char_name_ja,
            'unique_skill': unique,
            'inherit_skill': inherit,
        }
    except Exception as e:
        return {'error': str(e), 'card_id': card_id, 'name': char_name_zh}


def extract_unique_skill(html):
    """Extract unique skill data from HTML"""
    # Find section between 固有技能 and next section
    text = re.sub(r'<[^>]+>', '|', html)
    text = re.sub(r'\|+', '|', text)

    idx = text.find('固有技能')
    if idx < 0:
        return None

    # Get section after 固有技能 (before 觉醒技能 or other sections)
    end_idx = text.find('觉醒技能', idx)
    if end_idx < 0:
        end_idx = text.find('隐藏事件', idx)
    if end_idx < 0:
        end_idx = idx + 3000

    section = text[idx:end_idx]

    skill = {}
    fields = {
        'name_jp': r'[^|]*固有技能[^|]*\|([^|]+)\|([^|]+)',
    }

    # Extract skill name (pattern: JP_name / CN_name / EN_name)
    lines = [l.strip() for l in section.split('|') if l.strip() and len(l.strip()) > 1]

    # Find skill name (usually first few lines after 固有技能 header)
    for i, line in enumerate(lines[:15]):
        if '/' in line and not line.startswith('稀有度') and not line.startswith('条件') and not line.startswith('技能') and len(line) > 3:
            parts = line.split('/')
            if len(parts) >= 2:
                skill['name_jp'] = parts[0].strip()
                skill['name_zh'] = parts[1].strip()
                break

    # Extract rarity
    for i, line in enumerate(lines):
        if '稀有度' in line and i + 1 < len(lines):
            skill['rarity'] = lines[i + 1]
        if '条件限制' in line and i + 1 < len(lines):
            skill['restriction'] = lines[i + 1]
        if '技能描述' in line and i + 1 < len(lines):
            skill['desc_jp'] = lines[i + 1]
        if '中文描述' in line and i + 1 < len(lines):
            skill['desc_zh'] = lines[i + 1]
        if '触发条件' in line and i + 1 < len(lines):
            skill['trigger'] = lines[i + 1]
        if '触发代码' in line and i + 1 < len(lines):
            skill['trigger_code'] = lines[i + 1]

    return skill if skill.get('name_jp') else None


def extract_inherit_skill(html):
    """Extract inherit skill data from HTML"""
    # Check if inherit skill section exists
    if '继承技能' not in html:
        return None

    text = re.sub(r'<[^>]+>', '|', html)
    text = re.sub(r'\|+', '|', text)

    idx = text.find('继承技能')
    if idx < 0:
        return None

    end_idx = text.find('觉醒技能', idx)
    if end_idx < 0:
        end_idx = idx + 3000

    section = text[idx:end_idx]
    lines = [l.strip() for l in section.split('|') if l.strip() and len(l.strip()) > 1]

    skill = {}

    # Find skill name
    for i, line in enumerate(lines[:15]):
        if '/' in line and not line.startswith('稀有度') and not line.startswith('条件') and len(line) > 3:
            parts = line.split('/')
            if len(parts) >= 2:
                skill['name_jp'] = parts[0].strip()
                skill['name_zh'] = parts[1].strip()
                break

    # Extract fields
    for i, line in enumerate(lines):
        if '稀有度' in line and i + 1 < len(lines):
            skill['rarity'] = lines[i + 1]
        if '条件限制' in line and i + 1 < len(lines):
            skill['restriction'] = lines[i + 1]
        if '技能描述' in line and i + 1 < len(lines):
            skill['desc_jp'] = lines[i + 1]
        if '中文描述' in line and i + 1 < len(lines):
            skill['desc_zh'] = lines[i + 1]
        if '触发条件' in line and i + 1 < len(lines):
            skill['trigger'] = lines[i + 1]
        if '触发代码' in line and i + 1 < len(lines):
            skill['trigger_code'] = lines[i + 1]

    return skill if skill.get('name_jp') else None


# Test with Special Week first
print("Testing with 特别周...")
result = fetch_skill("特别周", "スペシャルウィーク", "100101", "chara_100101.png")
print(json.dumps(result, ensure_ascii=False, indent=2))
print()

# Now process all characters
print(f"Processing {len(data['characters'])} characters...")
for char in data['characters'][:5]:  # Start with first 5
    name_zh = char['name_zh']
    name_ja = char['name_ja']

    for variant in char['variants']:
        card_id = variant['card_id']
        avatar = variant['avatar']

        print(f"  Fetching {name_zh} (cardId: {card_id})...", end=' ')
        result = fetch_skill(name_zh, name_ja, card_id, avatar)

        if result and 'error' not in result:
            results.append(result)
            has_unique = '✓U' if result.get('unique_skill') else '✗U'
            has_inherit = '✓I' if result.get('inherit_skill') else '✗I'
            print(f"OK {has_unique} {has_inherit}")
        else:
            failed.append(result)
            print(f"FAIL: {result.get('error', 'unknown')}")

        time.sleep(0.5)  # Be nice to the server

print(f"\nDone! Success: {len(results)}, Failed: {len(failed)}")

# Save results
with open('/tmp/skill_data_test.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Saved to /tmp/skill_data_test.json")
