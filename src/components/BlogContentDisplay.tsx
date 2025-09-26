'use client';

import { useEffect, useRef } from 'react';
import { createLowlight } from 'lowlight';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import '@/styles/blog-content.css';

// Import common programming languages for syntax highlighting
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import dart from 'highlight.js/lib/languages/dart';
import r from 'highlight.js/lib/languages/r';
import matlab from 'highlight.js/lib/languages/matlab';
import scala from 'highlight.js/lib/languages/scala';
import clojure from 'highlight.js/lib/languages/clojure';
import haskell from 'highlight.js/lib/languages/haskell';
import lua from 'highlight.js/lib/languages/lua';
import perl from 'highlight.js/lib/languages/perl';
import powershell from 'highlight.js/lib/languages/powershell';
import yaml from 'highlight.js/lib/languages/yaml';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import markdown from 'highlight.js/lib/languages/markdown';

// Create lowlight instance and register all languages
const lowlight = createLowlight();

lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('java', java);
lowlight.register('cpp', cpp);
lowlight.register('css', css);
lowlight.register('html', html);
lowlight.register('sql', sql);
lowlight.register('json', json);
lowlight.register('bash', bash);
lowlight.register('php', php);
lowlight.register('ruby', ruby);
lowlight.register('go', go);
lowlight.register('rust', rust);
lowlight.register('swift', swift);
lowlight.register('kotlin', kotlin);
lowlight.register('dart', dart);
lowlight.register('r', r);
lowlight.register('matlab', matlab);
lowlight.register('scala', scala);
lowlight.register('clojure', clojure);
lowlight.register('haskell', haskell);
lowlight.register('lua', lua);
lowlight.register('perl', perl);
lowlight.register('powershell', powershell);
lowlight.register('yaml', yaml);
lowlight.register('dockerfile', dockerfile);
lowlight.register('markdown', markdown);

// Register languages with highlight.js
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', html);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('php', php);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('dart', dart);
hljs.registerLanguage('r', r);
hljs.registerLanguage('matlab', matlab);
hljs.registerLanguage('scala', scala);
hljs.registerLanguage('clojure', clojure);
hljs.registerLanguage('haskell', haskell);
hljs.registerLanguage('lua', lua);
hljs.registerLanguage('perl', perl);
hljs.registerLanguage('powershell', powershell);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('dockerfile', dockerfile);
hljs.registerLanguage('markdown', markdown);

interface BlogContentDisplayProps {
  content: string;
  className?: string;
}

export default function BlogContentDisplay({ content, className = '' }: BlogContentDisplayProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    console.log('BlogContentDisplay: Processing content for syntax highlighting');
    
    // Add a style tag to the document head to ensure our styles are loaded
    const styleId = 'blog-content-syntax-highlighting';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        .blog-content pre code.hljs {
          background: #1f2937 !important;
          color: #f9fafb !important;
        }
        .blog-content pre code.hljs .hljs-keyword,
        .blog-content pre code.hljs .hljs-selector-tag,
        .blog-content pre code.hljs .hljs-subst {
          color: #f472b6 !important;
          font-weight: bold !important;
        }
        .blog-content pre code.hljs .hljs-string,
        .blog-content pre code.hljs .hljs-doctag {
          color: #34d399 !important;
        }
        .blog-content pre code.hljs .hljs-comment,
        .blog-content pre code.hljs .hljs-quote {
          color: #6b7280 !important;
          font-style: italic !important;
        }
        .blog-content pre code.hljs .hljs-number,
        .blog-content pre code.hljs .hljs-literal {
          color: #fbbf24 !important;
        }
        .blog-content pre code.hljs .hljs-title,
        .blog-content pre code.hljs .hljs-section {
          color: #60a5fa !important;
          font-weight: bold !important;
        }
        .blog-content pre code.hljs .hljs-type {
          color: #a78bfa !important;
        }
        .blog-content pre code.hljs .hljs-tag,
        .blog-content pre code.hljs .hljs-name {
          color: #fb7185 !important;
        }
        .blog-content pre code.hljs .hljs-regexp,
        .blog-content pre code.hljs .hljs-link {
          color: #22d3ee !important;
        }
      `;
      document.head.appendChild(styleElement);
    }
    
    // Function to apply syntax highlighting
    const applySyntaxHighlighting = () => {
      // Find all code blocks and apply syntax highlighting
      const codeBlocks = contentRef.current?.querySelectorAll('pre code');
      
      if (!codeBlocks) return;
      
      console.log(`Found ${codeBlocks.length} code blocks`);
      
      codeBlocks.forEach((codeElement, index) => {
      const preElement = codeElement.parentElement;
      if (!preElement) return;

      // Get the language from the pre element's data attribute or class
      const language = preElement.getAttribute('data-language') || 
                      preElement.className.match(/language-(\w+)/)?.[1] ||
                      codeElement.className.match(/language-(\w+)/)?.[1] ||
                      '';

      console.log(`Code block ${index + 1}:`, {
        preClasses: preElement.className,
        codeClasses: codeElement.className,
        detectedLanguage: language,
        isRegistered: language ? lowlight.registered(language) : false,
        textContent: codeElement.textContent?.substring(0, 50) + '...'
      });

      if (language) {
        try {
          // Use highlight.js directly for syntax highlighting
          const result = hljs.highlight(codeElement.textContent || '', { language });
          console.log('Highlight.js result:', result);
          console.log('Highlighted HTML:', result.value);
          
          // Set the highlighted HTML
          codeElement.innerHTML = result.value;
          
          // Ensure the code element has the hljs class for styling
          codeElement.classList.add('hljs');
          codeElement.classList.add(`language-${language}`);
          
            // Force all styles with maximum specificity using cssText
            (codeElement as HTMLElement).style.cssText = `
              background-color: #1f2937 !important;
              color: #f9fafb !important;
              font-family: 'Fira Code', 'Monaco', 'Consolas', monospace !important;
              font-size: 0.875rem !important;
              line-height: 1.5 !important;
              padding: 1rem !important;
              border-radius: 0.5rem !important;
              display: block !important;
            `;
            
            // Add padding to the pre element instead
            if (preElement) {
              (preElement as HTMLElement).style.cssText = `
                background-color: #1f2937 !important;
                color: #f9fafb !important;
                padding: 1rem 1rem 1rem 1rem !important;
                padding-top: 3.125rem !important;
                border-radius: 0.75rem !important;
                overflow-x: auto !important;
                margin: 1.5rem 0 !important;
                font-family: 'Fira Code', 'Monaco', 'Consolas', monospace !important;
                font-size: 0.875rem !important;
                line-height: 1.5 !important;
                position: relative !important;
              `;
            }
          
          // Apply syntax highlighting styles with maximum force
          const syntaxElements = codeElement.querySelectorAll('span');
          syntaxElements.forEach((span) => {
            const classList = span.classList;
            let color = '#f9fafb';
            let fontWeight = 'normal';
            let fontStyle = 'normal';
            
            if (classList.contains('hljs-keyword') || classList.contains('hljs-selector-tag') || classList.contains('hljs-subst')) {
              color = '#f472b6';
              fontWeight = 'bold';
            } else if (classList.contains('hljs-string') || classList.contains('hljs-doctag')) {
              color = '#34d399';
            } else if (classList.contains('hljs-comment') || classList.contains('hljs-quote')) {
              color = '#6b7280';
              fontStyle = 'italic';
            } else if (classList.contains('hljs-number') || classList.contains('hljs-literal')) {
              color = '#fbbf24';
            } else if (classList.contains('hljs-title') || classList.contains('hljs-section')) {
              color = '#60a5fa';
              fontWeight = 'bold';
            } else if (classList.contains('hljs-type')) {
              color = '#a78bfa';
            } else if (classList.contains('hljs-tag') || classList.contains('hljs-name')) {
              color = '#fb7185';
            } else if (classList.contains('hljs-regexp') || classList.contains('hljs-link')) {
              color = '#22d3ee';
            }
            
            (span as HTMLElement).style.cssText = `
              color: ${color} !important;
              font-weight: ${fontWeight} !important;
              font-style: ${fontStyle} !important;
              background: transparent !important;
            `;
          });
          
          console.log(`Successfully applied ${language} syntax highlighting to code block ${index + 1}`);
          console.log('Code element classes after highlighting:', codeElement.className);
          console.log('Code element innerHTML preview:', codeElement.innerHTML.substring(0, 200) + '...');
          
          // Check if CSS classes are being applied
          const computedStyle = window.getComputedStyle(codeElement);
          console.log('Code element computed styles:', {
            backgroundColor: computedStyle.backgroundColor,
            color: computedStyle.color,
            fontFamily: computedStyle.fontFamily
          });
          
          // Check for any conflicting styles after a short delay
          setTimeout(() => {
            const delayedStyle = window.getComputedStyle(codeElement);
            console.log('Code element computed styles after delay:', {
              backgroundColor: delayedStyle.backgroundColor,
              color: delayedStyle.color,
              fontFamily: delayedStyle.fontFamily
            });
            console.log('Code element classes after delay:', codeElement.className);
            console.log('Code element innerHTML after delay:', codeElement.innerHTML.substring(0, 200) + '...');
            
            // Check if styles are being overridden
            if (delayedStyle.backgroundColor !== 'rgb(31, 41, 55)' || delayedStyle.color !== 'rgb(249, 250, 251)') {
              console.warn('Styles are being overridden! Reapplying...');
              
              // Force reapply the highlighting
              try {
                const result = hljs.highlight(codeElement.textContent || '', { language });
                codeElement.innerHTML = result.value;
                codeElement.classList.add('hljs');
                codeElement.classList.add(`language-${language}`);
                
                // Force inline styles as backup
                (codeElement as HTMLElement).style.setProperty('background-color', '#1f2937', 'important');
                (codeElement as HTMLElement).style.setProperty('color', '#f9fafb', 'important');
                
                console.log('Forced reapplication completed');
              } catch (error) {
                console.error('Failed to reapply highlighting:', error);
              }
            }
          }, 200);
          
          // Add language label and copy button to the parent container
          const parentContainer = preElement.parentElement;
          if (parentContainer && !parentContainer.querySelector('.code-block-wrapper')) {
            // Create wrapper div
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';
            wrapper.style.cssText = 'position: relative; margin: 1.5rem 0;';
            
            // Add language label (top left)
            const label = document.createElement('div');
            label.className = 'language-label';
            label.textContent = language.toUpperCase();
            label.style.cssText = `
              position: absolute;
              top: 0.75rem;
              left: 0.75rem;
              background: rgba(0, 0, 0, 0.8);
              color: #f9fafb;
              padding: 0.25rem 0.5rem;
              border-radius: 0.25rem;
              font-size: 0.75rem;
              text-transform: uppercase;
              font-weight: 500;
              font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
              z-index: 10;
              border: 1px solid rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(4px);
            `;
            wrapper.appendChild(label);
            
            // Move the pre element into the wrapper
            parentContainer.insertBefore(wrapper, preElement);
            wrapper.appendChild(preElement);
          }
        } catch (error) {
          console.warn(`Failed to highlight code block with language: ${language}`, error);
          // Fallback: still add language label even if highlighting fails
          const wrapper = preElement.parentElement?.querySelector('.code-block-wrapper');
          if (wrapper && !wrapper.querySelector('.language-label')) {
            const label = document.createElement('div');
            label.className = 'language-label';
            label.textContent = language.toUpperCase();
            label.style.cssText = `
              position: absolute;
              top: 0.75rem;
              left: 0.75rem;
              background: rgba(0, 0, 0, 0.8);
              color: #f9fafb;
              padding: 0.25rem 0.5rem;
              border-radius: 0.25rem;
              font-size: 0.75rem;
              text-transform: uppercase;
              font-weight: 500;
              font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
              z-index: 10;
              border: 1px solid rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(4px);
            `;
            wrapper.appendChild(label);
          }
        }
      }

      // Add copy button functionality (top right)
      const wrapper = preElement.parentElement?.querySelector('.code-block-wrapper');
      if (wrapper && !wrapper.querySelector('.copy-button')) {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy
        `;
        copyButton.style.cssText = `
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: rgba(0, 0, 0, 0.8);
          color: #f9fafb;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          opacity: 1;
          transition: all 0.2s ease;
          font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
          z-index: 10;
          backdrop-filter: blur(4px);
          font-weight: 500;
        `;
        
        copyButton.addEventListener('click', () => {
          navigator.clipboard.writeText(codeElement.textContent || '').then(() => {
            copyButton.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
              Copied!
            `;
            setTimeout(() => {
              copyButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
              `;
            }, 2000);
          });
        });
        
        copyButton.addEventListener('mouseenter', () => {
          copyButton.style.cssText += `
            background: rgba(0, 0, 0, 0.9);
            border-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          `;
        });
        
        copyButton.addEventListener('mouseleave', () => {
          copyButton.style.cssText = `
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            background: rgba(0, 0, 0, 0.8);
            color: #f9fafb;
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            opacity: 1;
            transition: all 0.2s ease;
            font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
            z-index: 10;
            backdrop-filter: blur(4px);
            font-weight: 500;
          `;
        });
        
        wrapper.appendChild(copyButton);
      }
    });
    };

    // Apply syntax highlighting initially
    applySyntaxHighlighting();
    
    // Set up a more aggressive monitor that reapplies styles constantly
    const styleMonitor = setInterval(() => {
      const codeBlocks = contentRef.current?.querySelectorAll('pre code');
      if (codeBlocks) {
        codeBlocks.forEach((codeElement) => {
          // Always reapply styles to ensure they persist
          const language = codeElement.className.match(/language-(\w+)/)?.[1];
          const preElement = codeElement.parentElement;
          const wrapper = preElement?.parentElement?.querySelector('.code-block-wrapper');
          
          // Check if we need to reapply highlighting OR if buttons are missing
          const needsHighlighting = language && !codeElement.classList.contains('hljs');
          const needsButtons = wrapper && (!wrapper.querySelector('.language-label') || !wrapper.querySelector('.copy-button'));
          
          if (needsHighlighting || needsButtons) {
            console.log('Reapplying syntax highlighting and/or buttons...');
            
            try {
              if (language) {
                const result = hljs.highlight(codeElement.textContent || '', { language });
                codeElement.innerHTML = result.value;
                codeElement.classList.add('hljs');
                codeElement.classList.add(`language-${language}`);
              
              // Force all styles with maximum specificity
              (codeElement as HTMLElement).style.cssText = `
                background-color: #1f2937 !important;
                color: #f9fafb !important;
                font-family: 'Fira Code', 'Monaco', 'Consolas', monospace !important;
                font-size: 0.875rem !important;
                line-height: 1.5 !important;
                padding: 1rem !important;
                border-radius: 0.5rem !important;
                display: block !important;
              `;
              
              // Add padding to the pre element instead
              if (preElement) {
                (preElement as HTMLElement).style.cssText = `
                  background-color: #1f2937 !important;
                  color: #f9fafb !important;
                  padding: 1rem 1rem 1rem 1rem !important;
                  padding-top: 3.125rem !important;
                  border-radius: 0.75rem !important;
                  overflow-x: auto !important;
                  margin: 1.5rem 0 !important;
                  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace !important;
                  font-size: 0.875rem !important;
                  line-height: 1.5 !important;
                  position: relative !important;
                `;
              }
              
              // Apply syntax highlighting styles with maximum force
              const syntaxElements = codeElement.querySelectorAll('span');
              syntaxElements.forEach((span) => {
                const classList = span.classList;
                let color = '#f9fafb';
                let fontWeight = 'normal';
                let fontStyle = 'normal';
                
                if (classList.contains('hljs-keyword') || classList.contains('hljs-selector-tag') || classList.contains('hljs-subst')) {
                  color = '#f472b6';
                  fontWeight = 'bold';
                } else if (classList.contains('hljs-string') || classList.contains('hljs-doctag')) {
                  color = '#34d399';
                } else if (classList.contains('hljs-comment') || classList.contains('hljs-quote')) {
                  color = '#6b7280';
                  fontStyle = 'italic';
                } else if (classList.contains('hljs-number') || classList.contains('hljs-literal')) {
                  color = '#fbbf24';
                } else if (classList.contains('hljs-title') || classList.contains('hljs-section')) {
                  color = '#60a5fa';
                  fontWeight = 'bold';
                } else if (classList.contains('hljs-type')) {
                  color = '#a78bfa';
                } else if (classList.contains('hljs-tag') || classList.contains('hljs-name')) {
                  color = '#fb7185';
                } else if (classList.contains('hljs-regexp') || classList.contains('hljs-link')) {
                  color = '#22d3ee';
                }
                
                (span as HTMLElement).style.cssText = `
                  color: ${color} !important;
                  font-weight: ${fontWeight} !important;
                  font-style: ${fontStyle} !important;
                  background: transparent !important;
                `;
              });
              
              // Ensure wrapper exists and add buttons
              let wrapper = preElement?.parentElement?.querySelector('.code-block-wrapper');
              
              // Create wrapper if it doesn't exist
              if (!wrapper && preElement) {
                const parentContainer = preElement.parentElement;
                if (parentContainer) {
                  wrapper = document.createElement('div');
                  wrapper.className = 'code-block-wrapper';
                  (wrapper as HTMLElement).style.cssText = 'position: relative; margin: 1.5rem 0;';
                  
                  // Move the pre element into the wrapper
                  parentContainer.insertBefore(wrapper, preElement);
                  wrapper.appendChild(preElement);
                }
              }
              
              if (wrapper) {
                // Always ensure language label exists
                if (!wrapper.querySelector('.language-label')) {
                  const label = document.createElement('div');
                  label.className = 'language-label';
                  label.textContent = language.toUpperCase();
                  label.style.cssText = `
                    position: absolute;
                    top: 0.75rem;
                    left: 0.75rem;
                    background: rgba(0, 0, 0, 0.8);
                    color: #f9fafb;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    font-weight: 500;
                    font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
                    z-index: 10;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(4px);
                  `;
                  wrapper.appendChild(label);
                }
                
                // Always ensure copy button exists
                if (!wrapper.querySelector('.copy-button')) {
                  const copyButton = document.createElement('button');
                  copyButton.className = 'copy-button';
                  copyButton.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy
                  `;
                  copyButton.style.cssText = `
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    background: rgba(0, 0, 0, 0.8);
                    color: #f9fafb;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    opacity: 1;
                    transition: all 0.2s ease;
                    font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
                    z-index: 10;
                    backdrop-filter: blur(4px);
                    font-weight: 500;
                  `;
                  
                  copyButton.addEventListener('click', () => {
                    navigator.clipboard.writeText(codeElement.textContent || '').then(() => {
                      copyButton.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                        Copied!
                      `;
                      setTimeout(() => {
                        copyButton.innerHTML = `
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          Copy
                        `;
                      }, 2000);
                    });
                  });
                  
                  wrapper.appendChild(copyButton);
                }
              }
              }
            } catch (error) {
              console.warn('Failed to reapply syntax highlighting:', error);
            }
          } else if (needsButtons && wrapper) {
            // Just add buttons if they're missing (even if highlighting is fine)
            console.log('Adding missing buttons...');
            
            // Add language label if missing
            if (!wrapper.querySelector('.language-label') && language) {
              const label = document.createElement('div');
              label.className = 'language-label';
              label.textContent = language.toUpperCase();
              label.style.cssText = `
                position: absolute;
                top: 0.75rem;
                left: 0.75rem;
                background: rgba(0, 0, 0, 0.8);
                color: #f9fafb;
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.75rem;
                text-transform: uppercase;
                font-weight: 500;
                font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
                z-index: 10;
                border: 1px solid rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(4px);
              `;
              wrapper.appendChild(label);
            }
            
            // Add copy button if missing
            if (!wrapper.querySelector('.copy-button')) {
              const copyButton = document.createElement('button');
              copyButton.className = 'copy-button';
              copyButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
              `;
              copyButton.style.cssText = `
                position: absolute;
                top: 0.75rem;
                right: 0.75rem;
                background: rgba(0, 0, 0, 0.8);
                color: #f9fafb;
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.75rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.25rem;
                opacity: 1;
                transition: all 0.2s ease;
                font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
                z-index: 10;
                backdrop-filter: blur(4px);
                font-weight: 500;
              `;
              
              copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(codeElement.textContent || '').then(() => {
                  copyButton.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                    Copied!
                  `;
                  setTimeout(() => {
                    copyButton.innerHTML = `
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Copy
                    `;
                  }, 2000);
                });
              });
              
              wrapper.appendChild(copyButton);
            }
          }
        });
      }
    }, 100); // Check every 100ms for maximum responsiveness
    
    // Cleanup
    return () => {
      clearInterval(styleMonitor);
      // Note: We don't remove the style element as it might be used by other instances
    };
  }, [content]);

  return (
    <div 
      ref={contentRef}
      className={`blog-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
