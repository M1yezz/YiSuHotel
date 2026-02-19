import React, { Component, PropsWithChildren } from 'react'
import { window } from '@tarojs/runtime'
import { ConfigProvider } from '@antmjs/vantui'
import '@antmjs/vantui/lib/index.css'
import './app.scss'

// Polyfill for React 18 in Mini Program environment
const globalAny: any = global;
if (typeof globalAny.HTMLElement === 'undefined') {
  if (window && window.HTMLElement) {
    globalAny.HTMLElement = window.HTMLElement;
  } else {
    globalAny.HTMLElement = class HTMLElement {};
  }
}
if (typeof globalAny.Element === 'undefined') {
    if (window && window.Element) {
        globalAny.Element = window.Element;
    } else {
        globalAny.Element = class Element {};
    }
}
if (typeof globalAny.Node === 'undefined') {
    if (window && window.Node) {
        globalAny.Node = window.Node;
    } else {
        globalAny.Node = class Node {};
    }
}

class App extends Component<PropsWithChildren> {
  render () {
    return (
      <ConfigProvider>
        {this.props.children}
      </ConfigProvider>
    )
  }
}

export default App
