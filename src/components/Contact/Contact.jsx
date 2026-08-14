import Section from '../common/Section.jsx';
import FadeInSection from '../common/FadeInSection.jsx';
import { about } from '../../data/about.js';

const { contact } = about;

const CHANNELS = [
  {
    key: 'email',
    label: 'Email',
    value: contact.email,
    href: `mailto:${contact.email}`,
    external: false,
    icon: (
      <path
        d="M4 6h16v12H4zM4 7l8 6 8-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    key: 'github',
    label: 'GitHub',
    value: 'pranati243',
    href: contact.github,
    external: true,
    icon: (
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.4 9.4 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
      />
    ),
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    value: 'pranati-arun',
    href: contact.linkedin,
    external: true,
    icon: (
      <path
        fill="currentColor"
        d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.6c0-1.34-.02-3.07-1.9-3.07-1.9 0-2.2 1.46-2.2 2.97V21h-4z"
      />
    ),
  },
  {
    key: 'location',
    label: 'Based in',
    value: contact.location,
    href: null,
    external: false,
    icon: (
      <path
        d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    key: 'phone',
    label: 'Phone',
    value: contact.phone,
    href: `tel:${contact.phone.replace(/\s/g, '')}`,
    external: false,
    icon: (
      <path
        d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
].filter((channel) => Boolean(channel.value));

export default function Contact() {
  return (
    <Section
      id="contact"
      eyebrow="05 — Contact"
      title="Get in touch"
      lead="Open to internships, collaborations, and any project where I get to build something people actually use."
    >
      <ul className="contact__grid" role="list">
        {CHANNELS.map((channel, index) => {
          // "Based in" is information, not a destination — render it as a plain
          // card so it never looks like a dead link.
          const Tag = channel.href ? 'a' : 'div';

          return (
            <FadeInSection key={channel.key} as="li" delay={index * 80}>
              <Tag
                className={`contact__card glass${channel.href ? ' glass--interactive' : ''}`}
                {...(channel.href ? { href: channel.href, 'data-tap': true } : {})}
                {...(channel.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
              >
                <span className="contact__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    {channel.icon}
                  </svg>
                </span>
                <span className="contact__meta">
                  <span className="contact__label">{channel.label}</span>
                  <span className="contact__value">{channel.value}</span>
                </span>
                {channel.href && (
                  <span className="contact__arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path
                        d="M5 12h14M13 6l6 6-6 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </Tag>
            </FadeInSection>
          );
        })}
      </ul>
    </Section>
  );
}
