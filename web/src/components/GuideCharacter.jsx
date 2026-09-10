import { useEffect, useState } from 'react';

const poseCopy = {
  hero: 'Hi, I am Mira. We can make the brief feel smaller, one step at a time.',
  questions: 'Start with what you know. The right questions give the project somewhere to go.',
  roadmap: 'A good plan is a sequence you can actually follow, not a wall of ambition.',
  review: 'You stay in charge. Check the roadmap, then decide when it is ready to begin.',
  cta: 'You have a next step now. That is enough to get moving.',
};

const observedPoses = ['hero', 'questions', 'roadmap', 'review', 'cta'];

export default function GuideCharacter({ initialPose = 'hero', message }) {
  const [pose, setPose] = useState(initialPose);

  useEffect(() => {
    const sections = observedPoses
      .map((sectionPose) => document.querySelector(`[data-guide-pose="${sectionPose}"]`))
      .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio);
        if (visible[0]) setPose(visible[0].target.dataset.guidePose);
      },
      { rootMargin: '-28% 0px -42% 0px', threshold: [0.2, 0.45, 0.7] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <aside className={`guide-dock guide-dock-${pose}`} aria-label="Mira, your ProjectMentor study guide">
      <div className="guide-bubble" role="status" aria-live="polite">
        <span>{message || poseCopy[pose]}</span>
        <strong>Mira</strong>
      </div>
      <div className="guide-art" aria-hidden="true">
        <svg viewBox="0 0 220 270" role="img" xmlns="http://www.w3.org/2000/svg">
          <g className="guide-svg">
            <ellipse className="guide-shadow" cx="108" cy="252" rx="57" ry="9" />
            <g className="guide-body">
              <path d="M71 180c0-26 17-42 38-42s39 16 39 42v60H71v-60Z" fill="var(--coral)" />
              <path d="M88 179c7 7 32 7 42 0v53H88v-53Z" fill="#f3d9d1" opacity=".9" />
              <path d="M77 188c15 11 49 11 64 0" fill="none" stroke="#e9a99b" strokeWidth="3" />
            </g>
            <g className="guide-head">
              <path d="M55 80c0-43 23-67 54-67 34 0 55 26 53 72v115c-13 13-27 18-39 20l-10-50H92l-10 50c-14-5-27-12-39-24L55 80Z" fill="#30252b" />
              <path d="M67 75c0-32 18-55 43-55s44 23 44 55v46c0 29-20 45-44 45s-43-16-43-45V75Z" fill="#f2bd91" />
              <path d="M65 76c1-42 19-61 46-61 27 0 43 20 44 59-15-4-29-14-38-28-13 18-32 28-52 30Z" fill="#3d2a2b" />
              <path d="M74 56c9-17 22-25 38-25 14 0 27 8 35 24-13-4-24-12-34-24-10 14-23 22-39 25Z" fill="#563a36" />
              <path d="M57 87c2 51 1 85-4 108 9 10 18 16 29 20l10-44-13-21V90L57 87ZM158 87v63l-12 21 10 44c11-4 20-11 28-20-6-25-6-59-4-108l-22 0Z" fill="#30252b" />
              <path d="M104 128c5 4 11 4 16 0" fill="none" stroke="#a45f54" strokeLinecap="round" strokeWidth="3" />
              <circle cx="79" cy="112" r="4" fill="#e59b89" opacity=".45" />
              <circle cx="141" cy="112" r="4" fill="#e59b89" opacity=".45" />
            </g>
            <g className="guide-eyes">
              <g className="guide-eye-open">
                <ellipse cx="89" cy="94" rx="9" ry="12" fill="#fff" stroke="var(--ink)" strokeWidth="2" />
                <ellipse cx="133" cy="94" rx="9" ry="12" fill="#fff" stroke="var(--ink)" strokeWidth="2" />
                <circle cx="90" cy="96" r="5" fill="#c96d8b" /><circle cx="132" cy="96" r="5" fill="#c96d8b" />
                <circle cx="92" cy="93" r="2" fill="#fff" /><circle cx="134" cy="93" r="2" fill="#fff" />
              </g>
              <path className="guide-eye-closed" d="M82 93h11M126 93h11" fill="none" stroke="var(--ink)" strokeLinecap="round" strokeWidth="3" />
            </g>
            <g className="guide-arms">
              <g className="guide-arms-rest">
                <path d="M77 180c-17 8-22 26-18 44" fill="none" stroke="#f2bd91" strokeLinecap="round" strokeWidth="13" />
                <path d="M143 180c17 8 22 26 18 44" fill="none" stroke="#f2bd91" strokeLinecap="round" strokeWidth="13" />
              </g>
              <g className="guide-arms-wave">
                <path d="M76 181c-18-7-24-25-17-43" fill="none" stroke="#f2bd91" strokeLinecap="round" strokeWidth="13" />
                <path d="M59 138c-4-12 4-22 12-26M59 137c-11-6-10-18-2-23M62 136c-2-13 7-20 14-20" fill="none" stroke="#f2bd91" strokeLinecap="round" strokeWidth="8" />
              </g>
              <g className="guide-arms-question">
                <path d="M78 182c-11-2-19-12-18-25" fill="none" stroke="#f2bd91" strokeLinecap="round" strokeWidth="13" />
                <path d="M141 181c10-5 14-13 14-27" fill="none" stroke="#f2bd91" strokeLinecap="round" strokeWidth="13" />
              </g>
              <g className="guide-arms-map">
                <path d="M79 185c-12-4-17-12-19-22M141 183c11-4 17-11 19-20" fill="none" stroke="#f2bd91" strokeLinecap="round" strokeWidth="13" />
              </g>
              <g className="guide-arms-check">
                <path d="M78 183c-13 1-18-6-20-17M143 183c13-5 18-15 16-27" fill="none" stroke="#f2bd91" strokeLinecap="round" strokeWidth="13" />
                <path d="M153 135l5 6 12-15" fill="none" stroke="var(--blueprint)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" />
              </g>
              <g className="guide-arms-celebrate">
                <path d="M77 184c-18-10-24-27-20-43M143 184c18-10 24-27 20-43" fill="none" stroke="#f2bd91" strokeLinecap="round" strokeWidth="13" />
                <path d="M56 141l-9-10M164 141l9-10" fill="none" stroke="#f2bd91" strokeLinecap="round" strokeWidth="8" />
              </g>
            </g>
            <g className="guide-accessory">
              <g className="guide-accessory-ribbon"><path d="M151 31c15-3 24 2 30 12-12 3-21 0-29-7Z" fill="#e6a0a3" /><path d="M153 33c-12-9-23-6-29 2 9 7 18 7 28 3Z" fill="#f0b7ad" /><circle cx="153" cy="34" r="6" fill="var(--yellow)" /></g>
              <g className="guide-accessory-notebook"><rect x="80" y="203" width="60" height="39" rx="3" fill="var(--yellow)" /><path d="M90 213h38M90 221h28" stroke="var(--ink)" strokeLinecap="round" strokeWidth="3" /></g>
              <g className="guide-accessory-question"><circle cx="164" cy="103" r="21" fill="var(--yellow)" /><text x="164" y="112" fill="var(--ink)" fontFamily="var(--display)" fontSize="28" fontWeight="700" textAnchor="middle">?</text></g>
              <g className="guide-accessory-map"><path d="m84 216 17-12 17 10 17-12v35l-17 10-17-10-17 12v-33Z" fill="var(--pale-blue)" stroke="var(--blueprint)" strokeWidth="3" /><path d="m101 204 0 33M118 214v33" stroke="var(--blueprint)" strokeWidth="2" /></g>
              <g className="guide-accessory-check"><circle cx="111" cy="222" r="22" fill="var(--yellow)" /><path d="m99 222 8 8 16-18" fill="none" stroke="var(--ink)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" /></g>
              <g className="guide-accessory-stars"><path d="m43 113 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8ZM176 91l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" fill="var(--yellow)" /></g>
            </g>
          </g>
        </svg>
      </div>
    </aside>
  );
}
