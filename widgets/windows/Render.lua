function Apply()
  local raw = SKIN:GetMeasure('UpdateData'):GetStringValue()
  local lines = {}
  for line in raw:gmatch('[^\r\n]+') do table.insert(lines, line) end
  SKIN:Bang('!SetOption', 'TitleText', 'Text', lines[1] or 'Streak Garden')
  SKIN:Bang('!SetOption', 'CountText', 'Text', lines[2] or 'Cannot refresh')
  SKIN:Bang('!SetOption', 'StatusText', 'Text', lines[3] or 'Check server connection')
  SKIN:Bang('!UpdateMeter', '*')
  SKIN:Bang('!Redraw')
end
