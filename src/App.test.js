import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('./utils.js', () => {
  const { searchInputTransformHelper, postsUrlCreationHelper  } = jest.requireActual('./utils.js');
  return{
  ...searchInputTransformHelper,
  postsUrlCreationHelper,
  /*postsUrlCreationHelper: jest.fn(() => ({
    url: 'https://www.reddit.com/r/popular.json?raw_json=1',
    showHomeFilters: true
  })),
  */
  postDataTransformationHelper: jest.fn().mockReturnValue([{
    title: "Test Title",
    author: "Test Author",
    score: 9999,
    num_comments: 1111,
    permalink: "test_link",
    preview: "test_preview"
  }]),
  searchInputTransformHelper: searchInputTransformHelper
}});

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import App from './App';
import { renderWithProvider } from './test-utils.js'
import { waitFor } from '@testing-library/react'

//Popular posts are fetched and displayed when app first runs
//Data transformation helper return value is mocked for this test
test('properly fetches and stores initial popular posts', async () => {
  
  global.fetch = jest.fn().mockResolvedValue({ok: true,
  json: async () => ({ data: { children: [] } }),})

  performance.getEntriesByType = jest.fn().mockReturnValue([{ type: 'navigate' }]);
  
  const user = userEvent.setup();
  const store = renderWithProvider(<App/>);
  
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
    "https://www.reddit.com/r/popular.json?raw_json=1",
    expect.anything()
  );
  });

  const state = store.getState();
  expect(state.posts.transformedPostData[0].title).toBe('Test Title');
  expect(state.posts.transformedPostData[0].author).toBe('Test Author');
  expect(state.posts.transformedPostData[0].score).toBe(9999);
  expect(state.posts.transformedPostData[0].num_comments).toBe(1111);
  expect(state.posts.transformedPostData[0].permalink).toBe('test_link');
  expect(state.posts.transformedPostData[0].preview).toBe('test_preview');
});

test ('properly fetches data according to search input', async () => {
  global.fetch = jest.fn().mockResolvedValue({ok: true,
  json: async () => ({ data: { children: [] } }),})

  performance.getEntriesByType = jest.fn().mockReturnValue([{ type: 'reload' }]);
  
  const user = userEvent.setup();
  const store = renderWithProvider(<App/>);

  const searchInput = await screen.findByTestId("searchInput");
  const searchButton = await screen.findByTestId("searchButton");

  await userEvent.type(searchInput, "test");
  await userEvent.click(searchButton);

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
    "https://www.reddit.com/search.json?q=test&type=posts&raw_json=1",
    expect.anything()
  );
  });
})
