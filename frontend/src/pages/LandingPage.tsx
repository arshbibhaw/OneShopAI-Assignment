import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#7828F0] selection:text-white">
      <main className="max-w-[800px] mx-auto px-6 py-20 lg:py-28">

        {/* Hero */}
        <header className="mb-20">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            I studied the product, then improved the parts that matter most.
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            A short walkthrough of what I noticed in the Opportunity Hub and Collab Space, what I changed, and the reasoning behind each decision.
          </p>
          <p className="text-[17px] text-slate-700 leading-relaxed mb-10">
            I spent time using the product the way a new member would. This page documents the friction I found, the improvements I built, and why I chose them. Every impact below is a hypothesis, along with the metric I would use to check it.
          </p>

          <Link to="/auth">
            <button className="bg-[#7828F0] hover:bg-[#6020c0] text-white px-8 py-3.5 rounded-full font-bold text-[15px] transition-colors shadow-sm flex items-center gap-2">
              Proceed to Authentication
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </button>
          </Link>
        </header>

        {/* The Landing Page Redesign */}
        <section className="mb-20">
          <div className="bg-slate-100 p-8 rounded-2xl border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200">The Design Philosophy</h2>
            <div className="space-y-12">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Why a minimal, structured landing page?</h3>
                <p className="text-slate-700 mb-2"><strong>What I changed:</strong> I redesigned the landing page from a generic welcome screen into a structured, document-style layout with a clean light theme.</p>
                <p className="text-slate-700 mb-2"><strong>Why:</strong> A landing page sets the tone. Instead of over-designing it with complex animations or unnecessary filler, I made it completely focused on the reasoning behind the improvements. A minimal, distraction-free layout signals professionalism and respect for the reader's time. It lets the work speak for itself.</p>
                <p className="text-slate-700"><strong>Expected impact:</strong> I expect evaluators or users to immediately understand the purpose of the assignment without being overwhelmed by visual noise.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Part 1 */}
        <section className="mb-20">
          <div className="bg-slate-100 p-8 rounded-2xl border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200">Part 1: Opportunity Hub</h2>
            <p className="text-[16px] text-slate-700 mb-10">
              I completed everything the assignment asked for in the Opportunity Hub. The five changes below are the improvements I added on top.
            </p>

            <div className="space-y-12">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">1. Quick Apply category</h3>
                <p className="text-slate-700 mb-2"><strong>What I changed:</strong> I added a dedicated Quick Apply category for opportunities that can be applied to quickly.</p>
                <p className="text-slate-700 mb-2"><strong>Why:</strong> Not every visitor arrives ready to read long descriptions. Some just want to act on something fast, and a separate category gives them a clear entry point.</p>
                <p className="text-slate-700"><strong>Expected impact:</strong> I expect more applications from visitors who would otherwise browse and leave. I would track the share of sessions that reach a submitted application.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">2. Separate view and apply</h3>
                <p className="text-slate-700 mb-2"><strong>What I changed:</strong> Viewing a role and applying for it are now two distinct steps. The view page gives a short summary of the role. The apply step is a redirect that appears only when the user decides they are interested and aligned.</p>
                <p className="text-slate-700 mb-2"><strong>Why:</strong> A summary helps people decide quickly whether a role fits them. Keeping the apply step separate means applications come from intent, not curiosity, which is better for candidates and for the people reviewing them.</p>
                <p className="text-slate-700"><strong>Expected impact:</strong> I expect fewer low-intent applications and a higher completion rate on the ones that start. I would track view to apply-click and apply-click to submit.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">3. Fewer listings up front, with View More</h3>
                <p className="text-slate-700 mb-2"><strong>What I changed:</strong> The page now shows a sensible number of popular listings first, followed by a View More option.</p>
                <p className="text-slate-700 mb-2"><strong>Why:</strong> A long, unbroken list makes it harder to scan and slows the page down. Showing the strongest listings first respects the visitor's attention and still lets them go deeper when they want to.</p>
                <p className="text-slate-700"><strong>Expected impact:</strong> I expect faster scanning and better engagement with the top listings. I would track view-more clicks and scroll depth.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">4. Horizontal scroll in categories</h3>
                <p className="text-slate-700 mb-2"><strong>What I changed:</strong> I implemented horizontal scrolling in the category section, which was not working correctly before.</p>
                <p className="text-slate-700 mb-2"><strong>Why:</strong> Categories are the main way people navigate. If they cannot be scrolled properly, visitors miss options without realising it, especially on smaller screens.</p>
                <p className="text-slate-700"><strong>Expected impact:</strong> I expect more category exploration, particularly on mobile. I would track category clicks per session.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">5. A clearer active state in the sidebar</h3>
                <p className="text-slate-700 mb-2"><strong>What I changed:</strong> I improved the sidebar design so the active section is easy to recognise.</p>
                <p className="text-slate-700 mb-2"><strong>Why:</strong> People should always know where they are. A clear active state reduces disorientation and makes navigation feel more confident.</p>
                <p className="text-slate-700"><strong>Expected impact:</strong> I expect fewer wrong turns and less back-and-forth between sections. I would track navigation reversals and time to reach a target page.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Part 2 */}
        <section className="mb-20">
          <div className="bg-slate-100 p-8 rounded-2xl border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200">Part 2: Collab Space</h2>
            <p className="text-[16px] text-slate-700 mb-10">
              For Collab Space, I designed the full flow around one idea: collaboration should move from discovery to joining to managing, without dead ends.
            </p>

            <div className="space-y-12">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">1. Discover Channels, Builder Directory and My Collabs</h3>
                <p className="text-slate-700 mb-2"><strong>What I built:</strong> Three clear sections. Discover Channels helps people find communities. Builder Directory helps them find other builders. My Collabs gives each user a single place for their own work.</p>
                <p className="text-slate-700 mb-2"><strong>Why:</strong> Each section answers a different question: where can I go, who can I work with, and what am I already part of. Separating them keeps every page focused.</p>
                <p className="text-slate-700"><strong>Expected impact:</strong> I expect easier discovery and more connections made. I would track the path from directory view to profile view to request sent.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">2. Project creation and an activity dashboard</h3>
                <p className="text-slate-700 mb-2"><strong>What I built:</strong> Users can create a project and see an activity dashboard with Projects Created and Projects Joined.</p>
                <p className="text-slate-700 mb-2"><strong>Why:</strong> People stay engaged when they can see their own progress. A simple summary also makes it obvious what they own and what they have joined.</p>
                <p className="text-slate-700"><strong>Expected impact:</strong> I expect more projects created and better return visits. I would track projects created per user and weekly returning users.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">3. Managing collaboration</h3>
                <p className="text-slate-700 mb-2"><strong>What I built:</strong> Applicants can track the status of their requests. Project owners can manage incoming requests in one place.</p>
                <p className="text-slate-700 mb-2"><strong>Why:</strong> Waiting without feedback is one of the most common reasons people disengage. Showing status to applicants and giving owners a clear queue keeps both sides informed.</p>
                <p className="text-slate-700"><strong>Expected impact:</strong> I expect faster decisions and fewer abandoned requests. I would track time from request to decision and the approval rate.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">4. Project management</h3>
                <p className="text-slate-700 mb-2"><strong>What I built:</strong> Members can see the projects they are part of. People with a pending request can see it, and can withdraw it. Members can also leave a project.</p>
                <p className="text-slate-700 mb-2"><strong>Why:</strong> Users should stay in control. Being able to withdraw a request or leave a project makes joining feel low-risk, which encourages people to try.</p>
                <p className="text-slate-700"><strong>Expected impact:</strong> I expect more people to send requests because the commitment feels reversible. I would track requests sent per user and the withdrawal rate.</p>
              </div>
            </div>
          </div>
        </section>



      </main>
    </div>
  );
}
