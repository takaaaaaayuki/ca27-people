export function formatText(text: string): string {
  if (!text) return ''
  
  let formatted = text
  
  // **太字** → <strong>太字</strong>
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
  
  // ==赤字== → <span class="text-red-500">赤字</span>
  formatted = formatted.replace(/==(.+?)==/g, '<span class="text-red-500 font-medium">$1</span>')
  
  // __下線__ → <u>下線</u>
  formatted = formatted.replace(/__(.+?)__/g, '<u>$1</u>')
  
  // 改行を<br>に変換
  formatted = formatted.replace(/\n/g, '<br>')
  
  return formatted
}