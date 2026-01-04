/**
 * FOOBAW Fantasy Football Report - Interactive Highlight Functions
 *
 * Provides hover-to-highlight functionality for Plotly charts:
 * - When hovering over a trace, all other traces are dimmed
 * - When mouse leaves, all traces return to full opacity
 */

/**
 * Setup hover-to-highlight behavior for a Plotly chart
 * @param {string} plotId - The ID of the plot div element
 */
function setupHighlight(plotId) {
    var plotDiv = document.getElementById(plotId);
    if (!plotDiv) {
        console.warn('Plot element not found: ' + plotId);
        return;
    }

    // Store original opacities
    var originalOpacities = [];
    var originalLineWidths = [];

    plotDiv.on('plotly_hover', function(data) {
        var curveNumber = data.points[0].curveNumber;
        var numTraces = plotDiv.data.length;

        // Save original values on first hover
        if (originalOpacities.length === 0) {
            for (var i = 0; i < numTraces; i++) {
                originalOpacities.push(plotDiv.data[i].opacity || 1.0);
                if (plotDiv.data[i].line) {
                    originalLineWidths.push(plotDiv.data[i].line.width || 2);
                } else {
                    originalLineWidths.push(2);
                }
            }
        }

        // Build update object
        var opacityUpdate = [];
        var widthUpdate = [];

        for (var i = 0; i < numTraces; i++) {
            if (i === curveNumber) {
                opacityUpdate.push(1.0);
                widthUpdate.push(4); // Make hovered line thicker
            } else {
                opacityUpdate.push(0.15);
                widthUpdate.push(1.5);
            }
        }

        Plotly.restyle(plotDiv, {
            'opacity': opacityUpdate,
            'line.width': widthUpdate
        });
    });

    plotDiv.on('plotly_unhover', function() {
        var numTraces = plotDiv.data.length;

        // Restore original values
        var opacityUpdate = [];
        var widthUpdate = [];

        for (var i = 0; i < numTraces; i++) {
            opacityUpdate.push(originalOpacities[i] || 1.0);
            widthUpdate.push(originalLineWidths[i] || 2);
        }

        Plotly.restyle(plotDiv, {
            'opacity': opacityUpdate,
            'line.width': widthUpdate
        });
    });
}

/**
 * Setup highlight for multiple plots
 * @param {Array} plotIds - Array of plot div IDs
 */
function setupAllHighlights(plotIds) {
    plotIds.forEach(function(id) {
        setupHighlight(id);
    });
}

/**
 * Generate consistent team colors based on final standing
 * Colors go from blue (1st place) to red (10th place)
 * @param {number} numTeams - Number of teams
 * @returns {Array} Array of hex color strings
 */
function getTeamColors(numTeams) {
    var colors = [];
    for (var i = 0; i < numTeams; i++) {
        // Interpolate from blue (#3498db) to red (#e74c3c)
        var ratio = i / (numTeams - 1);
        var r = Math.round(52 + (231 - 52) * ratio);
        var g = Math.round(152 + (76 - 152) * ratio);
        var b = Math.round(219 + (60 - 219) * ratio);
        colors.push('rgb(' + r + ',' + g + ',' + b + ')');
    }
    return colors;
}

/**
 * Default Plotly layout settings for consistency
 */
var defaultLayout = {
    font: {
        family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { t: 50, r: 30, b: 50, l: 60 },
    hovermode: 'closest',
    legend: {
        orientation: 'v',
        x: 1.02,
        y: 1,
        bgcolor: 'rgba(255,255,255,0.9)',
        bordercolor: '#ddd',
        borderwidth: 1
    }
};

/**
 * Default Plotly config settings
 */
var defaultConfig = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false
};

/**
 * Create a line chart with team data
 * @param {string} plotId - The ID of the plot div
 * @param {Object} data - Chart data object with teams array
 * @param {Object} layout - Additional layout options
 */
function createTeamLineChart(plotId, data, layout) {
    var traces = data.teams.map(function(team, i) {
        return {
            x: data.x,
            y: team.y,
            name: team.name,
            type: 'scatter',
            mode: 'lines+markers',
            line: {
                color: team.color,
                width: 2
            },
            marker: {
                size: 6
            },
            hovertemplate: '<b>' + team.name + '</b><br>' +
                           data.xLabel + ': %{x}<br>' +
                           data.yLabel + ': %{y:.1f}<extra></extra>'
        };
    });

    var fullLayout = Object.assign({}, defaultLayout, layout);

    Plotly.newPlot(plotId, traces, fullLayout, defaultConfig).then(function() {
        setupHighlight(plotId);
    });
}
