"use client"

import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDesktopClasses, getMobileClasses } from '@/utils/sidebarUtils'
import SidebarNav from './SidebarNav'

export default function Sidebar() {
  const [isMobile, setIsMobile] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {}, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen((prev) => !prev)
    } else {
      setIsCollapsed((prev) => !prev)
    }
  }

  const handleOutsideClick = () => {}

  const renderMenuIcon = (isOpen: boolean) => {
    return isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />
  }

  return (
    <div>
      {/* Mobile X toggle */}
      {isMobile && (
        <Button
          variant="ghost"
          onClick={toggleSidebar}
          className={cn(
            "fixed top-4 left-4 z-50 bg-transparent hover:bg-gray-100/50 backdrop-blur-sm",
            isOpen && "top-4 left-4"
          )}
        >
          {renderMenuIcon(isOpen)}
        </Button>
      )}

      {/* TODO: Store all components in nav */}
      {(!isMobile || isOpen) && (
        <div
          className={cn(
            "bg-gray-100 flex flex-col h-screen transition-all duration-300 overflow-y-auto",
            getMobileClasses(isMobile, isOpen),
            getDesktopClasses(isMobile, isCollapsed)
          )}>
          <div
            className={cn(
              "flex flex-col flex-frow p-6",
              isMobile ? "pt-16" : "pt-10"
            )}
          >
            <h1 className="text-4xl font-bold mb-10">AI Marketing Platform</h1>

            <SidebarNav isMobile={isMobile} isCollapsed={isCollapsed} />
          </div>

          <div>
            {/* TODO: User profile from clerk */}
          </div>

          {/*
          {isMobile && (
            <SidebarToggle
              isCollapsed={isCollapsed}
              toggleSidebar={toggleSidebar}
            />
          )}
          */}

        </div>
      )}

    </div>
  )
}
