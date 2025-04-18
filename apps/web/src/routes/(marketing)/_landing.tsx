import { Flex } from '@radix-ui/themes';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { Header } from '~/components/marketing/header';

export const getGithubStars = createServerFn({
  method: 'GET',
}).handler(async () => {
  // const response = await fetch('https://api.github.com/repos/Idee8/codecrawl');
  // const data = await response.json();
  // return data.stargazers_count;
  return 2343;
});

export const Route = createFileRoute('/(marketing)/_landing')({
  component: RouteComponent,
  loader: async () => {
    const stars = await getGithubStars();
    return { stars };
  },
});

function RouteComponent() {
  const state = Route.useLoaderData();

  return (
    <Flex
      direction={'column'}
      height={'100%'}
      flexGrow={'1'}
      style={{ backgroundColor: 'white' }}
    >
      <Header stars={state.stars} />
      <div className="custom-container space-y-12 pt-16 min-h-screen flex flex-col justify-between">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </Flex>
  );
}
