import { Flex } from '@radix-ui/themes';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { Footer } from '~/components/marketing/footer';
import { Header } from '~/components/marketing/header';
import type { User } from '~/contexts/auth-context';

export const getGithubStars = createServerFn({
  method: 'GET',
}).handler(async () => {
  const response = await fetch('https://api.github.com/repos/Idee8/codecrawl');
  const data = await response.json();
  return data.stargazers_count;
});

export const Route = createFileRoute('/(marketing)/_landing')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ['users/me'],
    });
    const stars = await getGithubStars();
    return { stars };
  },
});

function RouteComponent() {
  const state = Route.useLoaderData();
  const { data } = useSuspenseQuery<{ user: User | null }>({
    queryKey: ['users/me'],
  });

  return (
    <Flex
      direction={'column'}
      height={'100%'}
      flexGrow={'1'}
      style={{ backgroundColor: 'white' }}
    >
      <Header stars={state.stars} user={data.user} />
      <div className="custom-container space-y-12 pt-16 min-h-screen flex flex-col justify-between">
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </Flex>
  );
}
