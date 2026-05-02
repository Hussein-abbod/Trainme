import os
import glob
import re

files = glob.glob('*.html')

pattern = re.compile(r'(<div class="[^"]*rounded-full[^"]*">\s*)<div class="[^"]*rotate-45[^"]*"></div>(\s*</div>)')

def full_replacer(match):
    parent_start = match.group(1)
    parent_end = match.group(2)
    
    text_color = "text-primary" if "bg-white" in parent_start else "text-white"
    
    if "w-8" in parent_start: 
        size = "20px"
    elif "w-6" in parent_start: 
        size = "16px"
    else: 
        size = "18px"
        
    span = '<span class="material-symbols-outlined ' + text_color + ' text-[' + size + ']" style="font-variation-settings: \'FILL\' 1;">school</span>'
    return parent_start + span + parent_end

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    new_content = pattern.sub(full_replacer, content)
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Fixed logo in {f}")
