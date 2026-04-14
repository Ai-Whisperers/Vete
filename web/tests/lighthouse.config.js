module.exports = {
  ci: {
    collect: {
      staticDistDir: './public',
      url: ['http://localhost:3000'],
    },
    upload: {
      target: 'lhci',
      server: 'https://lhci.example.com',
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
      },
    },
  },
};