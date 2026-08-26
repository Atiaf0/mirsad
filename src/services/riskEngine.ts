export type RiskResult = {
  score: number
  level: 'منخفض' | 'متوسط' | 'مرتفع' | 'حرج'
  factors: string[]
}

export function calculateRisk(description: string, answers: string[] = [], channel = ''): RiskResult {
  const text = `${description} ${answers.join(' ')} ${channel}`.toLowerCase()
  const has = (...terms: string[]) => terms.some((term) => text.includes(term))
  const clicked = answers[0] === 'لا' ? false : answers[0] === 'نعم' || has('ضغطت', 'فتحت الرابط', 'نقرت', 'clicked')
  const credentials = answers[0] === 'لا' ? false : answers[0] === 'نعم' || has('كلمة المرور', 'كلمة مرور', 'بيانات الدخول', 'اعتماد', 'password')
  const workAccount = answers[1] === 'نعم' || has('حساب العمل', 'جهة العمل', 'حساب الشركة', 'work account')
  const attachment = has('مرفق', 'ملف', 'تنزيل', 'تحميل', 'download', 'attachment')
  const executed = has('شغلت', 'نفذت', 'تشغيل', 'execute')
  const sensitive = has('معلومات حساسة', 'معلومات الشركة', 'بيانات سرية', 'رقم الهوية', 'sensitive')
  const lostAccess = has('فقدت الوصول', 'لا أستطيع الدخول', 'لا استطيع الدخول', 'lost access')
  const compromised = has('اختراق', 'وصول غير مصرح', 'compromised')
  const suspicious = has('رابط', 'بريد', 'رسالة', 'مشبوه', 'suspicious', 'email', 'link')
  let score = (suspicious ? 25 : 0) + (clicked ? 20 : 0) + (credentials ? 30 : 0) + (sensitive ? 25 : 0) + (attachment ? 15 : 0) + (lostAccess ? 30 : 0) + (workAccount ? 20 : 0) + (executed ? 25 : 0) + (compromised ? 30 : 0)
  if (workAccount && (credentials || executed)) score = Math.max(score, 92)
  score = Math.min(score, 100)
  const factors = [
    suspicious && (clicked ? 'تم فتح رابط مشبوه' : 'تم استلام رسالة أو رابط مشبوه'),
    credentials && (workAccount ? 'تم إدخال بيانات اعتماد خاصة بالعمل' : 'تم إدخال بيانات الدخول'),
    sensitive && 'تم تعريض معلومات حساسة',
    attachment && 'تم فتح أو تنزيل مرفق مشبوه',
    lostAccess && 'تم فقدان الوصول إلى الحساب',
    compromised && 'توجد مؤشرات على وصول غير مصرح',
    channel && `الحادث وقع عبر ${channel}`,
  ].filter(Boolean) as string[]
  return { score, level: score >= 81 ? 'حرج' : score >= 61 ? 'مرتفع' : score >= 31 ? 'متوسط' : 'منخفض', factors }
}
