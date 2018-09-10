module.exports = {
  title: 'vue-translation-manager',
  description: 'Interactively translate your Vue components',
  base: '/vue-translation-manager/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Introduction', link: '/introduction' },
      { text: 'Github', link: 'https://www.github.com/cyon/vue-translation-manager' },
      { text: 'About cyon', link: 'https://www.cyon.ch' }
    ],
    sidebar: [
      '/introduction',
      '/installation',
      '/configuration',
      '/json-adapter',
      '/cli-usage',
      '/writing-new-adapters'
    ]
  }
}
