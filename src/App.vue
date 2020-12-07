<template>
  <div id="app">
    <nav-bar/>
    <aside-menu :menu="menu" @menu-click="menuClick"/>
    <div id="app-body">
      <router-view/>
    </div>
    <footer-bar/>
  </div>
</template>

<script>
// @ is an alias to /src
import NavBar from '@/components/NavBar'
import AsideMenu from '@/components/AsideMenu'
import FooterBar from '@/components/FooterBar'

export default {
  name: 'home',
  components: {
    FooterBar,
    AsideMenu,
    NavBar
  },
  computed: {
    menu () {
      return [
        'General',
        [
          {
            to: '/',
            icon: 'desktop-mac',
            label: 'Dashboard'
          }
        ],
        'Advanced',
        [
          // {
          //   action: 'dark-mode-toggle',
          //   label: 'Toggle Dark / White Mode',
          //   icon: 'weather-night'
          // },
          // {
          //   to: '/tables',
          //   label: 'Tables',
          //   icon: 'table',
          //   updateMark: true
          // },
          // {
          //   to: '/forms',
          //   label: 'Forms',
          //   icon: 'square-edit-outline'
          // },
          // {
          //   to: '/profile',
          //   label: 'Profile',
          //   icon: 'account-circle'
          // },
          {
            label: 'Master',
            subLabel: 'Submenus Example',
            icon: 'view-list',
            menu: [
              {
                href: '#void',
                label: 'Account'
              },
              {
                href: '#void',
                label: 'Customer & Supplier'
              },
              {
                href: '#void',
                label: 'Cost Center'
              },
              {
                href: '#void',
                label: 'Budget'
              },
              {
                href: '#void',
                label: 'Bank Reconciliation Statement'
              },
              {
                href: '#void',
                label: 'Bank News'
              }
            ]
          },
          {
            label: 'Inventory',
            subLabel: 'Submenus Example',
            icon: 'view-list',
            menu: [
              {
                href: '#void',
                label: 'Product/Service'
              },
              {
                href: '#void',
                label: 'Godown'
              },
              {
                href: '#void',
                label: 'Category'
              },
              {
                href: '#void',
                label: 'Unit Measurement'
              }
              // {
              //   href: '#void',
              //   label: 'Bank Reconciliation Statement'
              // },
              // {
              //   href: '#void',
              //   label: 'Bank News'
              // }
            ]
          },
          {
            label: 'Voucher',
            subLabel: 'Submenus Example',
            icon: 'view-list',
            menu: [
              {
                href: '#void',
                label: 'Receipt'
              },
              {
                href: '#void',
                label: 'Payment'
              },
              {
                href: '#void',
                label: 'Sale'
              },
              {
                href: '#void',
                label: 'Purchase'
              },
              {
                href: '#void',
                label: 'Contra'
              },
              {
                href: '#void',
                label: 'Journal'
              },
              {
                href: '#void',
                label: 'Sale Return'
              },
              {
                href: '#void',
                label: 'Purchase Return'
              },
              {
                href: '#void',
                label: 'Credit Note'
              },
              {
                href: '#void',
                label: 'Find/Edit Voucher'
              },
              {
                href: '#void',
                label: 'Billwise Accounting'
              }
            ]
          },
          {
            label: 'Documents',
            subLabel: 'Submenus Example',
            icon: 'view-list',
            menu: [
              {
                href: '#void',
                label: 'Delivery Note'
              },
              {
                href: '#void',
                label: 'Invoice'
              },
              {
                href: '#void',
                label: 'Cash Memo'
              },
              {
                href: '#void',
                label: 'Debit/Credit Note'
              },
              {
                href: '#void',
                label: 'Purchase/Sales Order'
              },
              {
                href: '#void',
                label: 'Transfer Note'
              },
              {
                href: '#void',
                label: 'Rejection Note'
              }
            ]
          },
          {
            label: 'GST',
            subLabel: 'Submenus Example',
            icon: 'view-list',
            menu: [
              {
                href: '#void',
                label: 'R1'
              },
              {
                href: '#void',
                label: 'GST Summary'
              }
              // {
              //   href: '#void',
              //   label: 'Cost Center'
              // },
              // {
              //   href: '#void',
              //   label: 'Budget'
              // },
              // {
              //   href: '#void',
              //   label: 'Bank Reconciliation Statement'
              // },
              // {
              //   href: '#void',
              //   label: 'Bank News'
              // }
            ]
          },
          {
            label: 'Administration',
            subLabel: 'Submenus Example',
            icon: 'view-list',
            menu: [
              {
                href: '#void',
                label: 'User'
              },
              {
                href: '#void',
                label: 'Change Password'
              },
              {
                href: '#void',
                label: 'Close Books/Roll Over'
              },
              {
                href: '#void',
                label: 'Company Preferences'
              },
              {
                href: '#void',
                label: 'Export Data'
              },
              {
                href: '#void',
                label: 'Import Data'
              },
              {
                href: '#void',
                label: 'Delete Company'
              }

            ]
          },
          {
            label: 'Help',
            subLabel: 'Submenus Example',
            icon: 'view-list',
            menu: [
              {
                href: '#void',
                label: 'Support'
              },
              {
                href: '#void',
                label: 'Manual'
              },
              {
                href: '#void',
                label: 'Shortcuts'
              },
              {
                href: '#void',
                label: 'Authors'
              },
              {
                href: '#void',
                label: 'License'
              }
              // {
              //   href: '#void',
              //   label: 'Bank News'
              // }
            ]
          }
        ],
        '',
        [
          {
            href: 'https://gnukhata.in',
            label: 'Report',
            icon: 'file-chart'
          }
        ],
        '',
        [
          {
            href: '#/About',
            label: 'About GNUKhata',
            icon: 'information-outline'
          }
          // {
          //   href: 'https://gitlab.com/gnukhata',
          //   label: 'Source Code',
          //   icon: 'source-repository'
          // }
        ]
      ]
    }
  },
  created () {
    this.$store.commit('user', {
      name: 'Admin',
      email: 'john@example.com',
      avatar: 'https://avatars.dicebear.com/v2/gridy/John-Doe.svg'
    })
  }
  // methods: {
  //   menuClick (item) {
  //     if (item.action && item.action === 'dark-mode-toggle') {
  //       this.$store.commit('darkModeToggle')
  //     }
  //   }
  // }
}
</script>
