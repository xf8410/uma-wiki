#!/usr/bin/env python3
"""Fast batch skill extraction from Bilibili Wiki"""

import json, re, time, html as html_module, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed

with open('/tmp/characters.json') as f:
    data = json.load(f)

results = {}

def fetch(name_zh, card_id):
    url = f"https://wiki.biligame.com/umamusume/api.php?action=parse&page={urllib.parse.quote(name_zh)}&prop=text&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = json.loads(resp.read())['parse']['text']['*']

        text = re.sub(r'\s+', ' ', html_module.unescape(re.sub(r'<[^>]+>', ' ', html)))

        # Extract unique skill
        unique = {}
        m = re.search(r'固有技能\s+([^/]+)/([^\s]+)', text)
        if m:
            unique['name_jp'] = m.group(1).strip()
            unique['name_zh'] = m.group(2).strip()

        # Extract fields around 稀有度
        m = re.search(r'稀有度\s*：\s*([^\s]+).*?条件限制\s*：\s*([^\s]+).*?技能描述\s*：\s*([^中文]+?)\s*中文描述\s*：\s*([^前置]+?)\s*触发代码\s*：\s*([^\s]+).*?触发条件\s*：\s*([^技能]+?)\s*技能类型\s*：\s*([^\s]+).*?技能数值\s*：\s*([^\s]+).*?持续时间\s*：\s*([^\s]+)', text)
        if m:
            unique.update({
                'rarity': m.group(1), 'restriction': m.group(2),
                'desc_jp': m.group(3).strip(), 'desc_zh': m.group(4).strip(),
                'trigger_code': m.group(5), 'trigger': m.group(6).strip(),
                'skill_type': m.group(7), 'value': m.group(8), 'duration': m.group(9)
            })

        # Check for inherit skill
        has_inherit = '普通·继承' in text or '继承技能' in text

        return card_id, {'unique': unique if unique.get('name_jp') else None, 'has_inherit': has_inherit}
    except Exception as e:
        return card_id, {'error': str(e)}

# Build task list
tasks = []
for char in data['characters']:
    for v in char['variants']:
        tasks.append((char['name_zh'], v['card_id']))

print(f"Tasks: {len(tasks)}")

# Process with thread pool
with ThreadPoolExecutor(max_workers=10) as exe:
    futures = {exe.submit(fetch, name, cid): (name, cid) for name, cid in tasks}
    for future in as_completed(futures):
        name, cid = futures[future]
        try:
            _, result = future.result()
            results[cid] = result
            status = "OK" if result.get('unique') else "NO_SKIL"
            if result.get('error'):
                status = f"ERR:{result['error'][:20]}"
            print(f"  {name} ({cid}): {status}")
        except Exception as e:
            print(f"  {name} ({cid}): EXC:{e}")

# Save
with open('/tmp/all_skills.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

ok = sum(1 for r in results.values() if r.get('unique'))
print(f"\nDone: {ok}/{len(results)} with unique skills")
