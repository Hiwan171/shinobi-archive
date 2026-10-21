"""Aplica e salva apenas as alterações deste projeto na janela já aberta."""
import json,time,win32gui,win32process
from pywinauto import Desktop
windows=[]
win32gui.EnumWindows(lambda h,_:windows.append(h) if win32process.GetWindowThreadProcessId(h)[1]==3892 and win32gui.GetWindowText(h)=='ShinobiArchiveHTML' else None,None)
assert len(windows)==1,'Janela alvo não encontrada'
window=Desktop(backend='uia').window(handle=windows[0])
results=[]
for phase in ['external','queries','fit','save']:
    buttons=window.descendants(control_type='Button')
    invoked=False
    for button in buttons:
        name=button.window_text().casefold().replace('\xa0',' ')
        aid=button.element_info.automation_id
        match=('externas' in name and 'aplic' in name) if phase=='external' else name=='aplicar alterações' if phase=='queries' else aid=='fitToPageButton' if phase=='fit' else aid=='save'
        if match and button.is_enabled():
            try:button.invoke();invoked=True;break
            except Exception:continue
    results.append({'operation':phase,'invoked':invoked})
    time.sleep(3 if phase in ['fit','save'] else 8)
print(json.dumps(results))
