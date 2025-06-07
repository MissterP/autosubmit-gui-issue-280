import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}


export const triggerDownload = (href, download) => {
  let link = document.createElement("a");
  link.href = href;
  link.download = download;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


/**
 * Very simple export to CSV utility
 * @param {Array} columns 
 * @param {Array<Array>} data 
 * @param {string} filename 
 */
export const exportToCSV = (columns, data, filename, sep = ",") => {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += columns.join(sep) + "\n";
  csvContent += data.map(row => row.join(sep)).join("\n");

  const encodedUri = encodeURI(csvContent);

  // Trigger download action
  triggerDownload(encodedUri, filename)
}


export const saveSVGObj = (svgData, filename) => {
  const svgString = (new XMLSerializer()).serializeToString(svgData);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  triggerDownload(svgUrl, filename)
}

export const saveSVGAsPNG = (svgElement, filename, scale = 2) => {
  try {
    const svgString = (new XMLSerializer()).serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Get SVG dimensions - handle both attached and detached elements
    let svgRect;
    if (svgElement.getBoundingClientRect) {
      svgRect = svgElement.getBoundingClientRect();
    } else {
      // Fallback for detached elements
      const width = svgElement.getAttribute('width') || svgElement.viewBox?.baseVal?.width || 800;
      const height = svgElement.getAttribute('height') || svgElement.viewBox?.baseVal?.height || 600;
      svgRect = { width: parseFloat(width), height: parseFloat(height) };
    }
    
    canvas.width = svgRect.width * scale;
    canvas.height = svgRect.height * scale;
    
    img.onload = function() {
      try {
        // Set white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the SVG image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to PNG and download
        canvas.toBlob(function(blob) {
          if (blob) {
            const url = URL.createObjectURL(blob);
            triggerDownload(url, filename);
            URL.revokeObjectURL(url);
          } else {
            console.error('Failed to create blob from canvas');
          }
        }, 'image/png');
      } catch (error) {
        console.error('Error drawing image to canvas:', error);
      } finally {
        // Clean up the data URL
        URL.revokeObjectURL(img.src);
      }
    };
    
    img.onerror = function(error) {
      console.error('Error loading SVG image:', error);
      URL.revokeObjectURL(img.src);
    };
    
    // Create data URL from SVG string
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
    
  } catch (error) {
    console.error('Error in saveSVGAsPNG:', error);
  }
}


export const STATUS_STYLES = {
  "UNKNOWN": {
    badge: "badge-status-unknown"
  },
  "WAITING": {
    badge: "badge-status-waiting"
  },
  "READY": {
    badge: "badge-status-ready"
  },
  "PREPARED": {
    badge: "badge-status-prepared"
  },
  "SUBMITTED": {
    badge: "badge-status-submitted"
  },
  "HELD": {
    badge: "badge-status-held"
  },
  "QUEUING": {
    badge: "badge-status-queuing"
  },
  "RUNNING": {
    badge: "badge-status-running"
  },
  "COMPLETED": {
    badge: "badge-status-completed"
  },
  "FAILED": {
    badge: "badge-status-failed"
  },
  "SUSPENDED": {
    badge: "badge-status-suspended"
  },
  "SKIPPED": {
    badge: "badge-status-skipped"
  },
  "DELAYED": {
    badge: "badge-status-delayed"
  },
}

export const getStatusBadgeStyle = (status) => {
  return STATUS_STYLES[status]?.badge || "badge-status-unknown";
};

export const parseLogPath = (logfile) => {
  const logPathSplit = logfile && logfile.length > 0 ? logfile.split("/") : [""];
  const logFileName = logPathSplit.pop();
  return logFileName;
};

/**
 * Extract model name from a climate model URL
 * @param {string} modelUrl - The URL of the climate model
 * @returns {string} - The extracted model name or the original string if not a URL
 */
export const extractModelName = (modelUrl) => {
  if (!modelUrl || typeof modelUrl !== 'string') {
    return modelUrl || '';
  }
  
  // If it's a URL, extract the basename (filename)
  if (modelUrl.includes('/')) {
    const parts = modelUrl.split('/');
    return parts[parts.length - 1] || modelUrl;
  }
  
  // If it's not a URL, return as is
  return modelUrl;
};
