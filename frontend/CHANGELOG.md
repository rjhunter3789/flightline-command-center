Update the latest entry:

  ## [1.4.1] - 2025-08-25

  ### Attempted Implementation
  - Implemented react-resizable-panels for panel dividers
  - This only provides fixed layout with adjustable dividers
  - Does NOT provide draggable/movable panels

  ### Current Limitations
  - Panels are in fixed positions (cannot be moved)
  - Only divider lines can be adjusted (if working)
  - Cannot resize from edges like windows
  - Cannot rearrange panel positions
  - Resize handles not responding properly

  ### What User Actually Needs
  - Floating draggable windows (like desktop applications)
  - Resize from any edge/corner
  - Free positioning anywhere on screen
  - Each panel as independent window

  ### Recommendation
  - Implement react-rnd (React Resizable and Draggable)
  - Each panel becomes a floating window
  - True window-like behavior
