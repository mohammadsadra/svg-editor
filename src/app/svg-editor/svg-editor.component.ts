import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { zoom, ZoomBehavior } from 'd3-zoom';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-svg-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './svg-editor.component.html',
  styleUrls: ['./svg-editor.component.css']
})
export class SvgEditorComponent implements OnInit {
  svg: any;
  selectedElement: any;
  attributes: any[] = [];
  isPreviewMode: boolean = false;
  showAttributeDialog: boolean = false;
  zoomBehavior!: ZoomBehavior<any, unknown>;
  labelText: string = 'SPEED'; // Default label text
  labelColor: string = '#000000'; // Default label color (black)
  labelImageDataUrl: string | null = null;
  selectedElements: any[] = [];

  // For context menu
  contextMenuVisible: boolean = false;
  contextMenuX: number = 0;
  contextMenuY: number = 0;
  contextMenuElement: any = null;

  // Map to store blink intervals and original colors
  blinkIntervals: Map<SVGElement, any> = new Map();

  uploadedFileName: string | null = null;

  customBlinkColor: string = '#ff0000'; // Default blink color (red)

  ngOnInit() {
  }

  /**
   * Handles global clicks to close the context menu when clicking outside.
   * @param event The mouse event.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any) {
    // If the click is outside the context menu, close it
    if (this.contextMenuVisible) {
      const contextMenuElement = document.getElementById('custom-context-menu');
      if (contextMenuElement && !contextMenuElement.contains(event.target)) {
        this.contextMenuVisible = false;
      }
    }
  }

  // Method to trigger the hidden file input
  triggerFileInput() {
    const fileInput = document.getElementById('svgFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  /**
   * Handles the selection of an SVG file.
   * @param event The file input change event.
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'image/svg+xml') {
      this.uploadedFileName = file.name; // Display the file name
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const svgContent = e.target.result;
        this.loadSvg(svgContent);
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid SVG file.');
      this.uploadedFileName = null;
    }
  }

  /**
   * Loads the SVG content into the container and sets up event listeners.
   * @param svgContent The SVG content as a string.
   */
  loadSvg(svgContent: string) {
    d3.select('#svg-container').html(svgContent);
    this.svg = d3.select('#svg-container').select('svg');
    this.svg.attr('width', '100%').attr('height', 'auto');

    // Ensure the SVG has a viewBox for proper scaling and positioning
    if (!this.svg.attr('viewBox')) {
      const width = this.svg.attr('width') ? parseFloat(this.svg.attr('width')) : 800;
      const height = this.svg.attr('height') ? parseFloat(this.svg.attr('height')) : 600;
      this.svg.attr('viewBox', `0 0 ${width} ${height}`);
    }

    // Create a group for SVG content
    const contentGroup = this.svg.append('g').attr('id', 'content-group');
    const svgContentNodes = this.svg.selectAll('*').filter(function (this: SVGElement) {
      return this.tagName !== 'g';
    });

    // Move all elements into contentGroup
    svgContentNodes.each((_: any, i: number, nodes: any) => {
      const node = nodes[i];
      contentGroup.node().appendChild(node);
    });

    // Define zoom behavior
    this.zoomBehavior = d3.zoom()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        contentGroup.attr('transform', event.transform);
      });

    this.svg.call(this.zoomBehavior);

    // Add event listeners to SVG elements
    contentGroup.selectAll('*')
      .on('click', (event: any, d: any) => {
        this.onElementClick(event, d);
      })
      .on('contextmenu', (event: any, d: any) => {
        this.onElementRightClick(event, d);
      });
  }

  /**
   * Handles right-clicks on the SVG container to add labels.
   * @param event The mouse event.
   */
  onContainerRightClick(event: MouseEvent) {
    if (!this.isPreviewMode) {
      event.preventDefault();
      const [x, y] = d3.pointer(event, event.currentTarget as HTMLElement);
      this.addLabelToElement(null, x, y); // Adding label without a parent
    }
  }

  /**
   * Handles the selection of an image file for labels.
   * @param event The file input change event.
   */
  onLabelImageSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.labelImageDataUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Adds a label (text or image) to a specific SVG element or at specified coordinates.
   * @param parentElement The SVG element to attach the label to. If null, adds at (x, y).
   * @param x The x-coordinate.
   * @param y The y-coordinate.
   */
  addLabelToElement(parentElement: SVGElement | null, x: number, y: number, text: string = this.labelText) {
    if (this.svg) {
      const contentGroup = this.svg.select('#content-group');
      const labelOffset = { x: 10, y: -10 }; // Offset to position label relative to the parent

      if (this.labelImageDataUrl) {
        // Add Image Label
        const labelElement = contentGroup.append('image')
          .attr('x', parentElement ? parseFloat(parentElement.getAttribute('x') || '0') + labelOffset.x : x)
          .attr('y', parentElement ? parseFloat(parentElement.getAttribute('y') || '0') + labelOffset.y : y)
          .attr('href', this.labelImageDataUrl)
          .attr('width', 50)
          .attr('height', 50)
          .attr('class', 'label')
          .attr('data-type', 'image');

        // Link the label to its parent element
        if (parentElement) {
          labelElement.attr('data-parent-id', parentElement.id || this.generateUniqueId());
          if (!parentElement.id) {
            parentElement.setAttribute('id', labelElement.attr('data-parent-id'));
          }
        }

        labelElement.on('contextmenu', (event: MouseEvent) => {
          event.preventDefault();
          this.showContextMenu(event, labelElement.node());
        });

        this.labelImageDataUrl = null;
      } else {
        // Add Text Label
        const labelElement = contentGroup.append('text')
          .attr('x', parentElement ? parseFloat(parentElement.getAttribute('x') || '0') + labelOffset.x : x)
          .attr('y', parentElement ? parseFloat(parentElement.getAttribute('y') || '0') + labelOffset.y : y)
          .text(text)
          .attr('fill', this.labelColor)
          .attr('font-family', 'Roboto-Regular, Roboto')
          .attr('font-size', '57.3px') // Ensure units are specified
          .attr('isolation', 'isolate')
          .attr('letter-spacing', '.05em')
          .attr('class', 'label')
          .attr('data-type', 'text');

        // Link the label to its parent element
        if (parentElement) {
          labelElement.attr('data-parent-id', parentElement.id || this.generateUniqueId());
          if (!parentElement.id) {
            parentElement.setAttribute('id', labelElement.attr('data-parent-id'));
          }
        }

        labelElement.on('contextmenu', (event: MouseEvent) => {
          event.preventDefault();
          this.showContextMenu(event, labelElement.node());
        });
      }
    }
  }

  /**
   * Generates a unique ID for SVG elements.
   * @returns A unique string ID.
   */
  generateUniqueId(): string {
    return 'elem-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Toggles the preview mode.
   */
  togglePreview() {
    this.isPreviewMode = !this.isPreviewMode;
    if (!this.isPreviewMode) {
      this.stopAllBlinkAnimations();
    }
  }

  /**
   * Handles left-clicks on SVG elements.
   * @param event The mouse event.
   * @param d The data bound to the element (unused).
   */
  onElementClick(event: any, d: any) {
    event.stopPropagation();
    if (!this.isPreviewMode) {
      // Left-click: Customize SVG tag
      this.selectedElement = event.currentTarget;
      this.extractAttributes();
      this.showAttributeDialog = true;
    } else {
      // In preview mode, start blink animation
      const element = event.currentTarget as SVGElement;
      if (!this.blinkIntervals.has(element)) {
        this.startBlinkAnimation(element);
      }
    }
  }

  /**
   * Starts the blink animation on an SVG element using the custom color.
   * @param element The SVG element to animate.
   */
  startBlinkAnimation(element: SVGElement) {
    const originalFill = element.getAttribute('fill') || '#000';
    const blinkColor = this.customBlinkColor; // Use custom color for blinking
    let isOriginalColor = true;

    const interval = setInterval(() => {
      element.setAttribute('fill', isOriginalColor ? blinkColor : originalFill);
      isOriginalColor = !isOriginalColor;
    }, 500); // Change color every 500ms

    this.blinkIntervals.set(element, interval);

    // Stop the animation after 5 seconds
    setTimeout(() => {
      clearInterval(interval);
      element.setAttribute('fill', originalFill);
      this.blinkIntervals.delete(element);
    }, 5000);
  }

  /**
   * Stops all ongoing blink animations.
   */
  stopAllBlinkAnimations() {
    this.blinkIntervals.forEach((interval, element) => {
      clearInterval(interval);
      const originalFill = element.getAttribute('data-original-fill') || '#000';
      element.setAttribute('fill', originalFill);
    });
    this.blinkIntervals.clear();
  }

  /**
   * Handles right-clicks on SVG elements to show the context menu.
   * @param event The mouse event.
   * @param d The data bound to the element (unused).
   */
  onElementRightClick(event: any, d: any) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isPreviewMode) {
      // Right-click: Show context menu
      this.showContextMenu(event, event.currentTarget);
    }
  }

  /**
   * Displays the custom context menu at the cursor's position.
   * @param event The mouse event.
   * @param element The SVG element that was right-clicked.
   */
  showContextMenu(event: MouseEvent, element: SVGElement) {
    const menuWidth = 150; // Width of the context menu
    const menuHeight = 120; // Updated height based on options
    let posX = event.clientX;
    let posY = event.clientY;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust position if context menu would overflow the viewport
    if (posX + menuWidth > viewportWidth) {
      posX = viewportWidth - menuWidth - 10; // 10px padding
    }

    if (posY + menuHeight > viewportHeight) {
      posY = viewportHeight - menuHeight - 10; // 10px padding
    }

    this.contextMenuVisible = true;
    this.contextMenuX = posX;
    this.contextMenuY = posY;
    this.contextMenuElement = element;
  }

  /**
   * Toggles the selection of an SVG element for export.
   * @param element The SVG element to toggle.
   */
  toggleElementSelection(element: any) {
    const index = this.selectedElements.indexOf(element);
    if (index === -1) {
      this.selectedElements.push(element);
      d3.select(element).classed('selected', true);
    } else {
      this.selectedElements.splice(index, 1);
      d3.select(element).classed('selected', false);
    }
  }

  /**
   * Removes an SVG element from the export selection.
   * @param element The SVG element to remove.
   */
  removeElementFromSelection(element: any) {
    const index = this.selectedElements.indexOf(element);
    if (index !== -1) {
      this.selectedElements.splice(index, 1);
      d3.select(element).classed('selected', false);
    }
  }

  /**
   * Extracts the attributes of the selected SVG element for editing.
   */
  extractAttributes() {
    this.attributes = [];
    const attrs = this.selectedElement.attributes;
    for (let i = 0; i < attrs.length; i++) {
      this.attributes.push({
        name: attrs[i].name,
        value: attrs[i].value
      });
    }
  }

  /**
   * Saves the edited attributes back to the selected SVG element.
   */
  saveAttributes() {
    this.attributes.forEach(attr => {
      this.selectedElement.setAttribute(attr.name, attr.value);
    });
    this.showAttributeDialog = false;
  }

  /**
   * Closes the attribute edit dialog.
   */
  closeDialog() {
    this.showAttributeDialog = false;
  }

  /**
   * Exports the selected SVG elements as a new SVG file.
   */
  exportSelectedElements() {
    if (this.selectedElements.length === 0) {
      alert('No elements selected for export.');
      return;
    }

    // Create a new SVG element
    const xmlns = 'http://www.w3.org/2000/svg';
    const svgEl = document.createElementNS(xmlns, 'svg');
    svgEl.setAttribute('xmlns', xmlns);
    svgEl.setAttribute('version', '1.1');

    // Calculate the bounding box of the selected elements
    const bbox = this.calculateBoundingBox(this.selectedElements);

    // Set the viewBox based on the bounding box
    svgEl.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
    svgEl.setAttribute('width', bbox.width.toString());
    svgEl.setAttribute('height', bbox.height.toString());

    // Clone the defs from the original SVG if any
    const defs = this.svg.select('defs').node();
    if (defs) {
      const clonedDefs = defs.cloneNode(true);
      svgEl.appendChild(clonedDefs);
    }

    // Create a group to hold the selected elements
    const gEl = document.createElementNS(xmlns, 'g');

    // Copy selected elements
    this.selectedElements.forEach(element => {
      // Clone the element deeply
      const clonedElement = element.cloneNode(true) as SVGGraphicsElement;
      gEl.appendChild(clonedElement);
    });

    svgEl.appendChild(gEl);

    // Serialize the SVG
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);

    // Create a Blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'exported_elements.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release the URL
    URL.revokeObjectURL(url);
  }

  /**
   * Calculates the bounding box that encompasses all selected SVG elements.
   * @param elements An array of SVG elements.
   * @returns A DOMRect representing the bounding box.
   */
  calculateBoundingBox(elements: SVGGraphicsElement[]): DOMRect {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    elements.forEach(element => {
      const bbox = element.getBBox();
      minX = Math.min(minX, bbox.x);
      minY = Math.min(minY, bbox.y);
      maxX = Math.max(maxX, bbox.x + bbox.width);
      maxY = Math.max(maxY, bbox.y + bbox.height);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      top: minY,
      left: minX,
      right: maxX,
      bottom: maxY,
      toJSON: () => {}
    } as DOMRect;
  }

  /**
   * Handles the "Add to Export" action from the context menu.
   */
  addElementToExport() {
    this.toggleElementSelection(this.contextMenuElement);
    this.contextMenuVisible = false;
  }

  /**
   * Handles the "Customize Element" action from the context menu.
   */
  customizeElement() {
    this.selectedElement = this.contextMenuElement;
    this.extractAttributes();
    this.showAttributeDialog = true;
    this.contextMenuVisible = false;
  }

  /**
   * Handles the "Add Label" action from the context menu.
   */
  addLabel() {
    this.contextMenuVisible = false;
    // Prompt user for label text and color (optional)
    const labelText = prompt('Enter label text:', this.labelText);
    if (labelText === null) return; // User cancelled

    const labelColor = prompt('Enter label color (hex code):', this.labelColor);
    const finalLabelColor = labelColor && /^#([0-9A-F]{3}){1,2}$/i.test(labelColor) ? labelColor : this.labelColor;

    this.labelText = labelText;
    this.labelColor = finalLabelColor;

    // Add label to the selected element
    this.addLabelToElement(this.contextMenuElement, 0, 0, labelText);
  }

  /**
   * Handles the "Export from all Elements" button.
   */
  exportAllElements() {
    if (!this.svg) {
      alert('No SVG loaded.');
      return;
    }

    const xmlns = 'http://www.w3.org/2000/svg';
    const svgEl = document.createElementNS(xmlns, 'svg');
    svgEl.setAttribute('xmlns', xmlns);
    svgEl.setAttribute('version', '1.1');

    // Clone the entire SVG contents
    const contentGroup = this.svg.select('#content-group').node();
    if (contentGroup) {
      const clonedContent = contentGroup.cloneNode(true);
      svgEl.appendChild(clonedContent);
    }

    // Set the viewBox to match the original SVG
    const viewBox = this.svg.attr('viewBox');
    if (viewBox) {
      svgEl.setAttribute('viewBox', viewBox);
    }

    // Serialize and export
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'exported_all_elements.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release the URL
    URL.revokeObjectURL(url);
  }


}
