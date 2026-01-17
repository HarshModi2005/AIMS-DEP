import Link from "next/link";
import {
    HelpCircle,
    BookOpen,
    Mail,
    MessageSquare,
    FileText,
    ExternalLink,
    ChevronRight,
    Clock,
    AlertCircle,
} from "lucide-react";

const helpTopics = [
    {
        title: "Getting Started",
        icon: BookOpen,
        items: [
            { question: "How do I login to AIMS?", answer: "Use your IIT Ropar Google account (@iitrpr.ac.in) to sign in. Click 'Sign in with Google' on the login page." },
            { question: "I can't access my account", answer: "Ensure you're using your official IIT Ropar email. If issues persist, contact aims_help@iitrpr.ac.in" },
            { question: "How do I navigate AIMS?", answer: "Use the navigation bar at the top to access different sections like Student Record, Courses, and Feedback." },
        ],
    },
    {
        title: "Course Enrollment",
        icon: FileText,
        items: [
            { question: "How do I enroll in courses?", answer: "Go to Courses → Courses for Enrollment. Select your desired courses and click 'Enroll'. Make sure enrollment is open for the current session." },
            { question: "What if a course is full?", answer: "Contact the course instructor directly to request enrollment. They may be able to increase the capacity." },
            { question: "How do I drop a course?", answer: "Go to Student Record and find the course. Click the 'Action' button and select 'Drop Course'. Note: Dropping is only allowed during the drop period." },
        ],
    },
    {
        title: "Course Feedback",
        icon: MessageSquare,
        items: [
            { question: "When can I submit feedback?", answer: "Feedback is only available during designated periods (Mid-sem and End-sem). The page will show 'Feedback not active' when submissions are closed." },
            { question: "Is my feedback anonymous?", answer: "Yes! ALL feedback submitted through AIMS is completely anonymous. Instructors cannot see who submitted what." },
            { question: "Can I edit my feedback?", answer: "No, feedback cannot be edited once submitted. Please review your responses carefully before submitting." },
        ],
    },
    {
        title: "Academic Records",
        icon: BookOpen,
        items: [
            { question: "Where can I see my grades?", answer: "Go to Student Record → Academics tab. Your grades for each semester and course are displayed there." },
            { question: "My grade seems incorrect", answer: "Contact your course instructor first. If unresolved, contact the academic section at academics@iitrpr.ac.in" },
            { question: "How is CGPA calculated?", answer: "CGPA is the weighted average of grade points across all semesters, weighted by course credits." },
        ],
    },
];

const quickLinks = [
    { title: "IIT Ropar Main Website", href: "https://www.iitrpr.ac.in", external: true },
    { title: "Academic Calendar", href: "/academic-info", external: false },
    { title: "Student Record", href: "/student-record", external: false },
    { title: "Course Enrollment", href: "/courses/enrollment", external: false },
];

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <HelpCircle className="h-8 w-8 text-indigo-400" />
                    <h1 className="text-2xl font-bold">Help & User Guide</h1>
                </div>

                {/* Contact Card */}
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-indigo-400">Need help?</h2>
                            <p className="text-zinc-400 mt-1">
                                If you can&apos;t find your answer below, reach out to us.
                            </p>
                        </div>
                        <a
                            href="mailto:aims_help@iitrpr.ac.in"
                            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors font-medium"
                        >
                            <Mail className="h-5 w-5" />
                            Contact Support
                        </a>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
                        <Clock className="h-4 w-4" />
                        <span>Typical response time: 24-48 hours</span>
                    </div>
                </div>

                {/* Important Notice */}
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 mb-8">
                    <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-amber-400 font-medium">Before contacting support</p>
                            <p className="text-zinc-400 text-sm mt-1">
                                Please check this guide first. For enrollment-related issues, contact your course instructor directly.
                                AIMS support cannot modify grades or enrollment records.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quickLinks.map((link) => (
                            <Link
                                key={link.title}
                                href={link.href}
                                target={link.external ? "_blank" : undefined}
                                rel={link.external ? "noopener noreferrer" : undefined}
                                className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-zinc-900/50 hover:bg-zinc-900 transition-colors group"
                            >
                                <span className="text-sm">{link.title}</span>
                                {link.external ? (
                                    <ExternalLink className="h-4 w-4 text-zinc-500 group-hover:text-indigo-400" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-indigo-400" />
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* FAQ Sections */}
                <div className="space-y-8">
                    {helpTopics.map((topic) => (
                        <div key={topic.title} className="rounded-xl border border-white/10 overflow-hidden">
                            <div className="flex items-center gap-3 px-6 py-4 bg-zinc-900/80">
                                <topic.icon className="h-5 w-5 text-indigo-400" />
                                <h2 className="text-lg font-semibold">{topic.title}</h2>
                            </div>
                            <div className="divide-y divide-white/10">
                                {topic.items.map((item, idx) => (
                                    <details key={idx} className="group">
                                        <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-white/5">
                                            <span className="font-medium">{item.question}</span>
                                            <ChevronRight className="h-5 w-5 text-zinc-500 transition-transform group-open:rotate-90" />
                                        </summary>
                                        <div className="px-6 pb-4 text-zinc-400">
                                            {item.answer}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Resources */}
                <div className="mt-8 rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                    <h2 className="text-lg font-semibold mb-4">Additional Resources</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-zinc-800/50 border border-white/5">
                            <h3 className="font-medium mb-2">Academic Section</h3>
                            <p className="text-sm text-zinc-400 mb-2">For grade-related queries, transcripts, and certificates</p>
                            <a href="mailto:academics@iitrpr.ac.in" className="text-indigo-400 text-sm hover:text-indigo-300">
                                academics@iitrpr.ac.in
                            </a>
                        </div>
                        <div className="p-4 rounded-lg bg-zinc-800/50 border border-white/5">
                            <h3 className="font-medium mb-2">IT Support</h3>
                            <p className="text-sm text-zinc-400 mb-2">For Google account and email issues</p>
                            <a href="mailto:cc@iitrpr.ac.in" className="text-indigo-400 text-sm hover:text-indigo-300">
                                cc@iitrpr.ac.in
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
