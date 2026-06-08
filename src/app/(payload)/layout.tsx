import 'server-only'

/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* Modified by vite-plugin-vinext-payload: extracted serverFunction to separate
   'use server' module for Vite RSC compatibility. */
import config from '@payload-config'
import '@payloadcms/next/css'
import { RootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap.js'
import './custom.scss'
import { serverFunction } from './serverFunction.js'

type Args = {
  children: React.ReactNode
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
