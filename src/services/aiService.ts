export type AiAnalysis = {
  incidentType: string
  indicators: string[]
  missingInformation: string[]
  suggestedQuestions: string[]
  confidence: number
  mitre?: string
}

export function analyzeIncident(description: string, answers: string[] = []): AiAnalysis {
  const text = `${description} ${answers.join(' ')}`.toLowerCase()
  const has = (...terms: string[]) => terms.some((term) => text.includes(term))
  const phishing = has('بريد', 'رابط', 'رسالة', 'بنك', 'ينتحل', 'تصيد', 'email', 'link')
  const malware = has('ملف', 'مرفق', 'برنامج', 'فيروس', 'برمجية', 'تشغيل', 'download', 'attachment')
  const compromise = has('اختراق', 'تم الدخول', 'وصول غير مصرح', 'فقدت الوصول', 'compromised')
  const exposure = has('معلومات حساسة', 'معلومات الشركة', 'بيانات سرية', 'رقم الهوية', 'sensitive')
  const indicators: string[] = []
  if (phishing) indicators.push('بريد أو رسالة مشبوهة', 'رابط مشبوه')
  if (answers[0] === 'نعم' || has('كلمة المرور', 'كلمة مرور', 'بيانات الدخول', 'اعتماد', 'password')) indicators.push('تعريض بيانات اعتماد')
  if (malware) indicators.push('مرفق أو ملف مشبوه')
  if (exposure) indicators.push('معلومات حساسة معرضة')
  if (compromise) indicators.push('احتمال اختراق الحساب')
  const suggestedQuestions: string[] = []
  if (phishing && !answers[0]) suggestedQuestions.push('هل ضغطت على الرابط؟')
  if ((phishing || malware) && !answers[1]) suggestedQuestions.push('هل أدخلت بيانات حساسة أو فتحت المرفق؟')
  if ((answers[0] === 'نعم' || compromise) && !answers[2]) suggestedQuestions.push('هل ما زلت تستطيع الوصول إلى حسابك؟')
  if (malware && !answers[1]) suggestedQuestions.push('هل فتحت المرفق أو شغّلت الملف؟')
  if (!suggestedQuestions.length) suggestedQuestions.push('هل يوجد أي أثر آخر لاحظته بعد الحادث؟')
  return {
    incidentType: compromise ? 'اختراق أو استيلاء على حساب' : malware ? 'اشتباه ببرمجية خبيثة' : phishing ? 'تصيد احتيالي وسرقة بيانات اعتماد' : exposure ? 'تعرّض بيانات حساسة' : 'حادث سيبراني غير مصنف',
    indicators: [...new Set(indicators)],
    missingInformation: compromise ? ['هل ما زال الحساب متاحًا؟'] : ['هل تم إدخال بيانات إضافية؟', 'هل تم فتح أي مرفق؟'],
    suggestedQuestions: [...new Set(suggestedQuestions)].slice(0, 3),
    confidence: phishing || malware || compromise ? 96 : 72,
    mitre: phishing ? 'T1566 · Phishing' : undefined,
  }
}
