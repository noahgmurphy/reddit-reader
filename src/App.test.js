import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { fetchPostComments } from './features/posts/postsSlice.js';
import { configureStore } from '@reduxjs/toolkit';
import { postsReducer } from './features/posts/postsSlice.js'

jest.mock('./utils.js', () => {
  const { searchInputTransformHelper, postsUrlCreationHelper, commentsUrlCreationHelper  } = jest.requireActual('./utils.js');
  return{
  //...searchInputTransformHelper,
  commentsUrlCreationHelper,
  postsUrlCreationHelper,
  postDataTransformationHelper: jest.fn().mockReturnValue([{
    title: "Test Title",
    author: "Test Author",
    score: 9999,
    num_comments: 1111,
    permalink: "test_link",
    preview:{images:[{source:{url:"test_preview"}}]}
  }]),
  commentDataTransformationHelper: jest.fn().mockReturnValue([
    {
      postTitle: "Test Post",
      previewImageUrl: "Test_Image_Url"
    },
    {
      commentIds: [1,2,3]
    },
    {
      body: "Test Comment Body"
    }
  ]),
  searchInputTransformHelper: searchInputTransformHelper
}});

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
   Link: ({ children, onClick, ...props }) => <button onClick={onClick} {...props}>{children}</button>
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
  expect(state.posts.transformedPostData[0].preview.images[0].source.url).toBe('test_preview');
});

test ('properly fetches data according to search input', async () => {
  global.fetch = jest.fn().mockResolvedValue({ok: true,
  json: async () => ({ data: { children: [] } }),})

  performance.getEntriesByType = jest.fn().mockReturnValue([{ type: 'navigate' }]);
  
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

test('properly filters posts', async () => {
  global.fetch = jest.fn().mockResolvedValue({ok: true,
  json: async () => ({ data: { children: [] } }),})

  performance.getEntriesByType = jest.fn().mockReturnValue([{ type: 'navigate' }]);
  
  const user = userEvent.setup();
  const store = renderWithProvider(<App/>);
  
  const filterSelect = await screen.findByTestId("filterSelect");
  await user.selectOptions(filterSelect, 'new')

   await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
    'https://www.reddit.com/r/popular/new.json?raw_json=1',
    expect.anything()
  );
  });
});


//Comments button in DOM not behaving correctly during tests due to react-window/infinite-loader
//This tests comments thunk behaviour and store update
test('thunk properly fetches and stores comments', async () => {
  global.fetch = jest.fn().mockResolvedValue({ok: true,
  json: async () => ({ data: { children: [] } }),})
  const store = configureStore({
    reducer:{
      posts: postsReducer
    }
  })
  await store.dispatch(fetchPostComments({  
      firstPage: true,
      permalink: 'test_link'
  }));
  expect(fetch).toHaveBeenCalledWith('https://www.reddit.comtest_link.json?&raw_json=1');
  const state = store.getState();
  expect(state.posts.transformedCommentData[0].postTitle).toBe('Test Post');
  expect(state.posts.transformedCommentData[0].previewImageUrl).toBe('Test_Image_Url');
  expect(state.posts.transformedCommentData[1].commentIds).toEqual([1,2,3]);
  expect(state.posts.transformedCommentData[2].body).toBe('Test Comment Body');
})
