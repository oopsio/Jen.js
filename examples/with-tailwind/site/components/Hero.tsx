import { FunctionComponent, h } from "preact";

interface HeroProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

const Hero: FunctionComponent<HeroProps> = ({
  title,
  subtitle,
  ctaText = "Get Started",
  ctaLink = "#",
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50 py-20 md:py-32">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-64 h-64 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 opacity-10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-64 h-64 rounded-full bg-gradient-to-br from-primary-600 to-blue-600 opacity-10 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-slide-up">
            {title}
          </h1>

          {subtitle && (
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed animate-slide-up">
              {subtitle}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
            <button className="btn-primary">{ctaText}</button>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
