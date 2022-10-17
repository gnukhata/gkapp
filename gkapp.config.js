const conf = {
  login_banner: {
    // allowed values are: true, false
    show: false,
    // allowed variants: primary, secondary, link, light, dark
    variant: 'info',
    // text, html is supported
    content: `This text appears in the login screen`,
  },
  sidebar_banner: {
    // allowed values are: true, false
    show: false,
    // allowed variants: primary, secondary, link, light, dark
    variant: 'info',
    // text, html is supported
    content: `This text appears inside the sidebar, after the user is logged in`,
  },
};

export default conf;
