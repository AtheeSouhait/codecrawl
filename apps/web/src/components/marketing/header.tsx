import { SvgLogoBlack, SvgGithubLogo } from '../svgs';
import { useScroll } from '~/hooks/use-scroll';
import { cn } from '~/utils/classnames';
import { kFormatter } from '~/utils/k-formatter';
import { Link } from '@tanstack/react-router';
import type { User } from '~/contexts/auth-context';

export function Header({ stars, user }: { stars: number; user: User | null }) {
  const scrolled = useScroll(10);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-white pt-5 pb-2 transition-all duration-100',
        {
          'border-b border-neutral-100': scrolled,
        },
      )}
    >
      <div className="grid md:grid-cols-5 grid-cols-2 w-full relative custom-container">
        <Link to="/" className="flex items-center justify-start gap-2.5">
          <SvgLogoBlack />
          <span className="text-base font-semibold text-neutral-900">
            Codecrawl
          </span>
        </Link>
        <div className="gap-8 col-span-3 hidden md:flex justify-center items-center text-neutral-900 font-medium">
          <Link to="/playground">Playground</Link>
          <a href="https://docs.codecrawl.com" target="_blank">
            Docs
          </a>
          <Link to="/blog">Blog</Link>
          <Link to="/updates">Updates</Link>
        </div>
        <div className="flex gap-8 justify-end relative items-center">
          <a
            href={'https://github.com/Idee8/codecrawl'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-900 flex items-center gap-3"
          >
            <SvgGithubLogo className="w-4 h-4" />
            {kFormatter(stars)}
          </a>
          {!user ? (
            <Link
              to="/signin"
              className={cn(
                'h-9 rounded-[10px] text-sm font-medium flex items-center transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 bg-[#fff] text-[#36322F] hover:bg-[#f0f0f0] disabled:bg-[#f5f5f5] disabled:text-[#8c8885] disabled:hover:bg-[#f5f5f5] [box-shadow:0_0_0_1px_hsl(35deg_22%_90%),_0_1px_2px_hsl(32,_10%,_68%),_0_3px_3px_hsl(32,11%,82%),_0_-2px_hsl(58,4%,93%)_inset] hover:translate-y-[1px] hover:scale-[0.98] hover:[box-shadow:0_0_0_1px_hsl(35deg_22%_90%),_0_1px_2px_hsl(32,_10%,_68%)] active:translate-y-[2px] active:scale-[0.97] active:[box-shadow:0_0_0_1px_hsl(35deg_22%_90%),_inset_0_1px_1px_hsl(32,_10%,_68%)] disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100 px-2.5 py-1',
              )}
            >
              Sign In
            </Link>
          ) : (
            <Link
              to="/app/playground"
              className={cn(
                'h-9 rounded-[10px] text-sm font-medium flex items-center transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 bg-[#36322F] text-[#fff] hover:bg-[#4a4542] disabled:bg-[#8c8885] disabled:hover:bg-[#8c8885] [box-shadow:inset_0px_-2.108433723449707px_0px_0px_#171310,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(58,_33,_8,_58%)] hover:translate-y-[1px] hover:scale-[0.98] hover:[box-shadow:inset_0px_-1px_0px_0px_#171310,_0px_1px_3px_0px_rgba(58,_33,_8,_40%)] active:translate-y-[2px] active:scale-[0.97] active:[box-shadow:inset_0px_1px_1px_0px_#171310,_0px_1px_2px_0px_rgba(58,_33,_8,_30%)] disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100 px-2.5 py-1',
              )}
            >
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
