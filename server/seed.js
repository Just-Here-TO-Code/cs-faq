const mongoose = require('mongoose');
require('dotenv').config();
const FAQ = require('./models/FAQ');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crowdfaq';

const sampleFAQs = [
  {
    question: 'Who is eligible to apply for the internship?',
    answer: 'Students currently in their 2nd or 3rd year of undergraduate study are eligible to apply. Final-year students and postgraduate students may also apply depending on the program. Check the specific program announcement for exact eligibility criteria.',
    category: 'Applications',
    tags: ['eligibility', 'students', 'requirements'],
    keywords: ['eligible', 'apply', 'year', 'undergraduate', 'student'],
    status: 'approved',
    helpfulYes: 42, helpfulNo: 2, views: 210,
  },
  {
    question: 'How do I submit my application?',
    answer: 'Applications are submitted through the official portal at the link provided in the program announcement. Fill in all required fields, attach your resume, a statement of purpose, and any supporting documents. Make sure to submit before the deadline — late applications are not accepted.',
    category: 'Applications',
    tags: ['application', 'portal', 'submission', 'documents'],
    keywords: ['submit', 'apply', 'portal', 'form', 'deadline'],
    status: 'approved',
    helpfulYes: 38, helpfulNo: 1, views: 185,
  },
  {
    question: 'What is the stipend for the internship?',
    answer: 'The monthly stipend varies by program and role. Typically, stipends range from ₹10,000 to ₹25,000 per month based on your year of study, skills, and the specific project. The exact amount will be mentioned in your offer letter.',
    category: 'Stipend',
    tags: ['stipend', 'salary', 'pay', 'monthly'],
    keywords: ['stipend', 'salary', 'money', 'pay', 'compensation'],
    status: 'approved',
    helpfulYes: 55, helpfulNo: 3, views: 320,
  },
  {
    question: 'When will stipends be disbursed?',
    answer: 'Stipends are typically disbursed on the last working day of each month. For the first month, disbursement may be delayed by 7–10 days due to onboarding processes. All payments are made directly to your registered bank account.',
    category: 'Stipend',
    tags: ['stipend', 'payment', 'disbursement', 'bank'],
    keywords: ['when', 'paid', 'disbursed', 'payment date', 'bank'],
    status: 'approved',
    helpfulYes: 30, helpfulNo: 1, views: 150,
  },
  {
    question: 'What is the duration and timeline of the internship?',
    answer: 'The internship typically runs for 8–12 weeks during the summer (May–July) or winter (December–January) break. The exact start and end dates are communicated in the offer letter. Attendance for the full duration is mandatory.',
    category: 'Timeline',
    tags: ['duration', 'timeline', 'dates', 'schedule'],
    keywords: ['duration', 'how long', 'timeline', 'weeks', 'start', 'end date'],
    status: 'approved',
    helpfulYes: 47, helpfulNo: 0, views: 240,
  },
  {
    question: 'When does the application window open and close?',
    answer: 'Applications typically open 6–8 weeks before the internship start date. The window remains open for 3–4 weeks. Specific dates are announced on the official website and social media channels. Enable notifications to stay updated.',
    category: 'Timeline',
    tags: ['deadline', 'application window', 'dates', 'open'],
    keywords: ['deadline', 'when', 'open', 'close', 'window', 'application date'],
    status: 'approved',
    helpfulYes: 35, helpfulNo: 2, views: 175,
  },
  {
    question: 'Will I receive a certificate after completing the internship?',
    answer: 'Yes! All interns who successfully complete the program and meet the performance requirements receive an official completion certificate. The certificate is issued digitally within 2–4 weeks of the internship end date and can be verified online.',
    category: 'Certificates',
    tags: ['certificate', 'completion', 'credential', 'digital'],
    keywords: ['certificate', 'certification', 'get', 'receive', 'completion', 'credential'],
    status: 'approved',
    helpfulYes: 61, helpfulNo: 1, views: 290,
  },
  {
    question: 'What kind of projects will I work on?',
    answer: 'Projects span multiple domains including software development, data science, machine learning, UI/UX design, research, and product management. You will be assigned to a real team and contribute to live projects. The specific project is shared after selection based on your skills and preferences.',
    category: 'Projects',
    tags: ['projects', 'domains', 'work', 'assignments', 'tech'],
    keywords: ['project', 'work on', 'domain', 'assignment', 'type', 'task'],
    status: 'approved',
    helpfulYes: 50, helpfulNo: 2, views: 265,
  },
  {
    question: 'Is the internship remote, hybrid, or on-site?',
    answer: 'Most positions offer a hybrid mode — 2–3 days on-site per week. Some roles may be fully remote depending on the team. The mode of work is mentioned in the individual job listing. Relocation support is not provided for hybrid/on-site roles.',
    category: 'General',
    tags: ['remote', 'hybrid', 'on-site', 'work mode'],
    keywords: ['remote', 'online', 'hybrid', 'office', 'work from home', 'on-site'],
    status: 'approved',
    helpfulYes: 44, helpfulNo: 3, views: 200,
  },
  {
    question: 'Can I apply for multiple roles or programs?',
    answer: 'Yes, you may apply to up to 2 different roles or programs simultaneously. However, if selected for more than one, you must accept only one offer within 48 hours of receiving it. Applying to multiple roles does not increase your chances — tailor each application to the specific role.',
    category: 'Applications',
    tags: ['multiple', 'roles', 'apply', 'programs'],
    keywords: ['multiple', 'two', 'more than one', 'apply', 'roles', 'programs'],
    status: 'approved',
    helpfulYes: 28, helpfulNo: 4, views: 135,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await FAQ.deleteMany({});
    console.log('🗑️  Cleared existing FAQs');

    await FAQ.insertMany(sampleFAQs);
    console.log(`🌱 Seeded ${sampleFAQs.length} FAQs successfully`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
}

seed();
