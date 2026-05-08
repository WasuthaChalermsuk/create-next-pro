export default {
  GET: (req: any, res: any) => {
    const posts = [
      { id: 1, title: 'First Post', content: 'Hello World' },
      { id: 2, title: 'Second Post', content: 'Another post' },
    ];
    res.json(posts);
  },
  
  POST: (req: any, res: any) => {
    const newPost = {
      id: Date.now(),
      ...req.body,
    };
    res.status(201).json(newPost);
  },
};
