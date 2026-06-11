const fs = require('fs')
const path = require('path')

const filePaths = [
  path.join(__dirname, 'src/app/(frontend)/page.tsx'),
  path.join(__dirname, 'src/app/(frontend)/cart/page.tsx'),
]

const replacements = [
  { search: /bg-\[#0A0A0A\]/g, replace: 'bg-background' },
  { search: /bg-\[#111111\]/g, replace: 'bg-card' },
  { search: /bg-\[#1A1A1A\]/g, replace: 'bg-muted' },
  { search: /text-\[#F9F9F9\]/g, replace: 'text-foreground' },
  { search: /text-\[#F5B82A\]/g, replace: 'text-primary' },
  { search: /bg-\[#F5B82A\]/g, replace: 'bg-primary' },
  { search: /border-\[#F5B82A\]/g, replace: 'border-primary' },
  { search: /border-\[#F5B82A\]\/20/g, replace: 'border-border' },
  { search: /border-\[#F5B82A\]\/30/g, replace: 'border-border' },
  { search: /border-\[#F5B82A\]\/40/g, replace: 'border-border' },
  { search: /border-\[#F5B82A\]\/50/g, replace: 'border-primary/50' },
  { search: /fill-\[#F5B82A\]/g, replace: 'fill-primary' },
  { search: /hover:bg-\[#DCA54A\]/g, replace: 'hover:bg-primary-hover' },
  { search: /hover:text-\[#DCA54A\]/g, replace: 'hover:text-primary-hover' },
  { search: /hover:text-\[#F5B82A\]/g, replace: 'hover:text-primary' },
  { search: /hover:border-\[#F5B82A\]/g, replace: 'hover:border-primary' },
  { search: /group-hover:text-\[#F5B82A\]/g, replace: 'group-hover:text-primary' },
  { search: /group-hover:border-\[#F5B82A\]/g, replace: 'group-hover:border-primary' },
  { search: /group-hover:bg-\[#F5B82A\]\/10/g, replace: 'group-hover:bg-primary/10' },
  { search: /text-white/g, replace: 'text-foreground' },
  { search: /text-black/g, replace: 'text-background' },
  { search: /bg-transparent/g, replace: 'bg-transparent' },
]

filePaths.forEach((filePath) => {
  let content = fs.readFileSync(filePath, 'utf8')
  replacements.forEach(({ search, replace }) => {
    content = content.replace(search, replace)
  })
  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`Updated ${filePath}`)
})
