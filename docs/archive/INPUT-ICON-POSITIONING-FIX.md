# Input Icon Positioning Fix

## Issue Identified
From the uploaded registration form image, the input field icons are not properly positioned - they appear to overlap with the placeholder text or are too close to the input text.

## Root Cause
The left padding on inputs with icons needs to be increased to provide adequate space for the icon and prevent overlap with text.

## Current Values
- Icon position: `left: 1rem` (16px)
- Input left padding: `3rem` (48px)
- Icon size: `20px`

## Problem
With icon at 16px from left and 20px wide, it occupies 16px-36px space.
Input text starts at 48px, leaving only 12px gap between icon and text - too tight!

## Solution
Increase input left padding to provide better spacing:
- Icon position: `left: 1rem` (16px) - KEEP
- Input left padding: `3.5rem` (56px) - INCREASE
- This creates 20px gap between icon (ends at 36px) and text (starts at 56px)

## Files to Update
1. `Step1AccountCreation.css` - Multi-step registration Step 1
2. `Step2RoleSpecific.css` - Multi-step registration Step 2  
3. `LoginForm.css` - Login form
4. `RegisterForm.css` - Register form (if has icons)

## Visual Improvement
```
Before: [Icon]Text starts here  (12px gap - too tight)
After:  [Icon]    Text starts here  (20px gap - perfect)
```
