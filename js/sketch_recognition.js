// Generated by CoffeeScript 1.9.1
(function() {
  var CLOSED_THRESHOLD, COMPILE_TO, PRETTY_DRAW_COLOR, PRETTY_DRAW_SIZE, 
      ask_paleo, count_corners, loner_name_count, node_name_count, regression,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; 
      i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  node_name_count = 0;
  loner_name_count = 0;
  PRETTY_DRAW_COLOR = 'black';
  PRETTY_DRAW_SIZE = 2;
  COMPILE_TO = 'LaTeX';
  CLOSED_THRESHOLD = .05;

  this.pretty_draw = function(ctx, canvas, drawing) {
    var corner, end, len, len1, len2, len3, len4, loner, m, midpoint, node, o, 
      p, point1, r, ref, ref1, ref2, ref3, ref4, ref5, rise, run, s, start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ref = Object.keys(drawing.edges);
    for (m = 0, len = ref.length; m < len; m++) {
      start = ref[m];
      ref1 = drawing.edges[start];
      for (o = 0, len1 = ref1.length; o < len1; o++) {
        end = ref1[o];
        ctx.beginPath();
        ctx.moveTo(drawing.nodes[start].center_x, 
          drawing.nodes[start].center_y);
        ctx.lineTo(drawing.nodes[end].center_x, drawing.nodes[end].center_y);
        ctx.stroke();
        ctx.closePath();
        if (ref2 = start + " " + end, indexOf.call(drawing.arrows, ref2) >= 0) {
          point1 = [drawing.nodes[start].center_x, 
            drawing.nodes[start].center_y];
          rise = drawing.nodes[end].center_y - drawing.nodes[start].center_y;
          run = drawing.nodes[end].center_x - drawing.nodes[start].center_x;
          midpoint = [point1[0] - run * .2, point1[1] - rise * .2];
        }
      }
    }
    ref3 = Object.keys(drawing.nodes);
    for (p = 0, len2 = ref3.length; p < len2; p++) {
      node = ref3[p];
      if (drawing.nodes[node].type.circle >= drawing.nodes[node].type.polygon) {
        ctx.beginPath();
        ctx.arc(drawing.nodes[node].center_x, drawing.nodes[node].center_y, 
          drawing.nodes[node].radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
      }
      else{
        // regular polygon.
        ctx.beginPath();
        ctx.moveTo(drawing.nodes[node].corners[0].x, 
          drawing.nodes[node].corners[0].y);
        ref4 = drawing.nodes[node].corners;
        for (r = 0, len3 = ref4.length; r < len3; r++) {
          corner = ref4[r];
          ctx.lineTo(corner.x, corner.y);
        }
        ctx.lineTo(drawing.nodes[node].corners[0].x, 
          drawing.nodes[node].corners[0].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
    ref5 = drawing.loners;
    for (s = 0, len4 = ref5.length; s < len4; s++) {
      loner = ref5[s];
      ctx.beginPath();
      ctx.moveTo(loner.start[0], loner.start[1]);
      ctx.lineTo(loner.end[0], loner.end[1]);
      ctx.strokeStyle = "red";
      ctx.stroke();
      ctx.strokeStyle = "black";
      ctx.closePath();
    }
  };

  this.distance_formula = function(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  };

  this.recognize = function(current_stroke_x, current_stroke_y, current_times, 
      ctx, canvas, drawing) {
    var average_x, average_y, circle_sum, closed, closeness, corner_guess, 
      corners, distance, end_distance, i, m, o, radius, ref, ref1, sketch_size,
        total_stroke_length;
    sketch_size = current_stroke_x.length;
    closed = false;
    corners = count_corners(current_stroke_x, current_stroke_y, current_times);

    total_stroke_length = 0;
    for (i = m = 1, ref = sketch_size; 1 <= ref ? m < ref : m > ref; i = 1 <= 
        ref ? ++m : --m) {
      total_stroke_length += distance_formula(current_stroke_x[i], 
          current_stroke_y[i], current_stroke_x[i - 1], 
          current_stroke_y[i - 1]);
    }
    end_distance = distance_formula(current_stroke_x[0], current_stroke_y[0], 
      current_stroke_x[current_stroke_x.length - 1], 
      current_stroke_y[current_stroke_y.length - 1]);
    closeness = end_distance / total_stroke_length;
    if (closeness < CLOSED_THRESHOLD) {
      closed = true;
    }
    if (closed) {
      corner_guess = {
        "circle": 1 * corners.length
      };
      circle_sum = 0;
      for (i = o = 0, ref1 = corners.length; 0 <= ref1 ? o < ref1 : o > ref1; 
          i = 0 <= ref1 ? ++o : --o) {
        circle_sum += corners[i].r;
      }
      corner_guess["circle"] = 1 - (circle_sum / corners.length);
      average_x = current_stroke_x.reduce(function(total, num) {
        return total + num;
      }) / sketch_size;
      average_y = current_stroke_y.reduce(function(total, num) {
        return total + num;
      }) / sketch_size;
      distance = 0;
      i = 0;
      while (i < sketch_size) {
        distance += Math.sqrt(Math.pow(current_stroke_x[i] - average_x, 2) + 
          Math.pow(current_stroke_y[i] - average_y, 2));
        i++;
      }
      radius = distance / sketch_size;
      if (corners.length > 2) {
        corner_guess["polygon"] = .8;
      } else {
        corner_guess["polygon"] = 0;
      }
      drawing['nodes'][node_name_count] = {
        name: node_name_count,
        type: corner_guess,
        known: false,
        center_x: Math.floor(average_x),
        center_y: Math.floor(average_y),
        radius: Math.floor(radius),
        corners: corners
      };
      drawing.nodelabels[node_name_count] = "Node " + node_name_count;
      node_name_count++;
    }

    // not a corner
    else {
      if (corners) {
        drawing['loners'].push({
          name: 'Loner ' + loner_name_count,
          type: 'arrow',
          start: [current_stroke_x[0], current_stroke_y[0]],
          end: [current_stroke_x[sketch_size - 1], 
            current_stroke_y[sketch_size - 1]]
        });
      }
      drawing['loners'].push({
        name: 'Loner ' + loner_name_count,
        type: 'line',
        start: [current_stroke_x[0], current_stroke_y[0]],
        end: [current_stroke_x[sketch_size - 1], 
          current_stroke_y[sketch_size - 1]]
      });
      loner_name_count++;
    }
    //snap_to(drawing, 10);
    return drawing;
  };

  this.snap_to = function(drawing, grid) {
    var len, m, name, node, ref, results;
    ref = Object.keys(drawing.nodes);
    results = [];
    for (m = 0, len = ref.length; m < len; m++) {
      name = ref[m];
      node = drawing.nodes[name];
      if (node.type === "circle") {
        node.center_x = Math.round(node.center_x / grid) * grid;
        node.center_y = Math.round(node.center_y / grid) * grid;
        results.push(node.radius = Math.round(node.radius / grid) * grid);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  count_corners = function(list_x, list_y, times) {
    var ARCTAN_THRESHOLD, CURVATURE_THRESHOLD, SEPARATION, SPEED_THRESHOLD, 
      SPEED_THRESHOLD_2, STRAIGHTNESS, WINDOW, bottom, corners, 
      corrected_slopes, cum_arc_length, curr_distance, current_wrap, curvatures,
        i, j, k, l, last_found, lr, m, number_of_points, o, p, r, radians, ref, 
        ref1, ref2, ref3, slope, slopes, speeds, top, total_stroke_length;
    WINDOW = 10;
    ARCTAN_THRESHOLD = 1;
    number_of_points = list_x.length;
    corners = [];
    slopes = [0];
    cum_arc_length = [0];
    total_stroke_length = 0;
    speeds = [0];
    for (i = m = 1, ref = number_of_points - 1; 1 <= ref ? m < ref : m > ref; 
        i = 1 <= ref ? ++m : --m) {
      top = Math.min(i + WINDOW, number_of_points - 1);
      bottom = Math.max(0, i - WINDOW);
      slope = (list_y[top] - list_y[bottom]) / (list_x[top] - list_y[bottom]);
      radians = Math.atan(slope);
      slopes.push(radians);
      curr_distance = distance_formula(list_x[i - 1], list_y[i - 1], list_x[i], 
        list_y[i]);
      total_stroke_length += curr_distance;
      cum_arc_length.push(total_stroke_length);
      speeds.push(curr_distance / (times[i] - times[i - 1]));
    }
    slopes[0] = slopes[1];
    speeds[0] = speeds[1];
    slopes[number_of_points - 1] = slopes[number_of_points - 2];
    speeds[number_of_points - 1] = speeds[number_of_points - 2];
    cum_arc_length.push(total_stroke_length + 
      distance_formula(list_x[number_of_points - 2], 
        list_y[number_of_points - 2], list_x[number_of_points - 1], 
        list_y[number_of_points - i]));
    current_wrap = 0;
    corrected_slopes = [slopes[0]];
    for (j = o = 1, ref1 = number_of_points; 1 <= ref1 ? o < ref1 : o > ref1; 
        j = 1 <= ref1 ? ++o : --o) {
      if (slopes[j - 1] > ARCTAN_THRESHOLD && slopes[j] < -ARCTAN_THRESHOLD) {
        current_wrap++;
      } else if (slopes[j - 1] < -ARCTAN_THRESHOLD && slopes[j] > 
          ARCTAN_THRESHOLD) {
        current_wrap--;
      }
      corrected_slopes.push(slopes[j] + current_wrap * Math.PI);
    }
    curvatures = [0];
    for (k = p = 1, ref2 = number_of_points - 1; 1 <= ref2 ? p < ref2 : p > 
        ref2; k = 1 <= ref2 ? ++p : --p) {
      top = Math.min(k + 1, number_of_points - 1);
      bottom = Math.max(0, k - 1);
      curvatures.push((corrected_slopes[top] - corrected_slopes[bottom]) / 
        (cum_arc_length[top] - cum_arc_length[bottom]));
    }
    curvatures[0] = curvatures[1];
    curvatures[number_of_points - 1] = curvatures[number_of_points - 2];
    last_found = 0;
    STRAIGHTNESS = 1;
    SEPARATION = .1 * total_stroke_length;
    CURVATURE_THRESHOLD = .06;
    SPEED_THRESHOLD = .45 * (total_stroke_length / (times[times.length - 1] -
      times[0]));
    SPEED_THRESHOLD_2 = .9 * (total_stroke_length / (times[times.length - 1] -
      times[0]));
    for (l = r = 1, ref3 = number_of_points - 1; 1 <= ref3 ? r < ref3 : r > 
        ref3; l = 1 <= ref3 ? ++r : --r) {
      lr = regression(list_x.slice(last_found, l + 1), list_y.slice(last_found, 
        l + 1));
      if (speeds[l - 1] > speeds[l] && speeds[l + 1] > speeds[l] && speeds[l] < 
          SPEED_THRESHOLD && lr["r2"] < STRAIGHTNESS) {
        if (distance_formula(list_x[last_found], list_y[last_found], list_x[l], 
            list_y[l]) > SEPARATION) {
          corners.push({
            "x": list_x[l],
            "y": list_y[l],
            "t": times[l],
            "r": lr["r2"]
          });
        }
        last_found = l;
      } else if (curvatures[l - 1] < curvatures[l] && curvatures[l + 1] < 
          curvatures[l] && curvatures[l] > CURVATURE_THRESHOLD && speeds[l] < 
          SPEED_THRESHOLD_2 && lr["r2"] < STRAIGHTNESS) {
        if (distance_formula(list_x[last_found], list_y[last_found], list_x[l], 
            list_y[l]) > SEPARATION) {
          corners.push({
            "x": list_x[l],
            "y": list_y[l],
            "t": times[l],
            "r": lr["r2"]
          });
        }
        last_found = l;
      }
    }
    return corners;
  };

  regression = function(x, y) {
    var lr, m, n, q, ref, sum_x, sum_xx, sum_xy, sum_y, sum_yy;
    lr = {};
    n = y.length;
    sum_x = 0;
    sum_y = 0;
    sum_xy = 0;
    sum_xx = 0;
    sum_yy = 0;
    for (q = m = 1, ref = y.length; 1 <= ref ? m < ref : m > ref; q = 1 <= 
        ref ? ++m : --m) {
      sum_x += x[q];
      sum_y += y[q];
      sum_xy += x[q] * y[q];
      sum_xx += x[q] * x[q];
      sum_yy += y[q] * y[q];
    }
    lr["slope"] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    lr["intercept"] = (sum_y - lr.slope * sum_x) / n;
    lr["r2"] = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - 
      sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);
    return lr;
  };

}).call(this);
