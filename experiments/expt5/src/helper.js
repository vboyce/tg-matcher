export function shuffle(arr) {
  var i = arr.length,
    j,
    temp;
  while (--i > 0) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[j];
    arr[j] = arr[i];
    arr[i] = temp;
  }
}

function pop_random(items) {
  let id = Math.floor(Math.random() * items.length);
  return items[id];
}
export function no_repetitions(items) {
  let curr_items = items.slice();
  let happy_items = [];
  happy_items.push(curr_items[0]);
  curr_items.splice(0, 1);
  while (happy_items.length < items.length) {
    let valid_ops = curr_items.filter((i) => {
      return i.tangram != happy_items[happy_items.length - 1].tangram;
    });
    if (valid_ops.length > 0) {
      let chosen = pop_random(valid_ops);
      happy_items.push(chosen);
      curr_items.splice(curr_items.indexOf(chosen), 1);
    } else {
      const to_insert = curr_items[0];
      const valid_idxs = [...Array(happy_items.length).keys()].filter(
        (i) =>
          i > 1 &&
          happy_items[i].tangram != to_insert.tangram &&
          happy_items[i - 1].tangram != to_insert.tangram
      );
      const insert_idx = Math.floor(Math.random() * valid_idxs.length);
      happy_items = [
        ...happy_items.slice(0, insert_idx),
        to_insert,
        ...happy_items.slice(insert_idx),
      ];
      curr_items.splice(0, 1);
    }
  }
  return happy_items;
}
export function subset(items, total) {
  let select_items = [];
  //let types = ["2_rotate_1", "2_rotate_6", "6_rotate_1", "6_rotate_6"];
  shuffle(items);
  select_items = items.slice(0, total);
  return no_repetitions(select_items);
}

export function do_yoked_stimuli(stimuli, yoked) {
  let conditions = [...new Set(stimuli.map((i) => i.gameId))];
  shuffle(conditions);
  let target_condition = conditions[0];
  let target_items = stimuli.filter((i) => i.gameId == target_condition);
  if (yoked == "yoked") {
    return target_items;
  } else {
    shuffle(target_items);
    return no_repetitions(target_items);
  }
}

let raw_choices = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export function do_backwards_across_stimuli(stimuli, yoked) {
  if (yoked == "backwards") {
    let conditions = [...new Set(stimuli.map((i) => i.gameId))];
    shuffle(conditions);
    let target_condition = conditions[0];
    let target_items = stimuli.filter((i) => i.gameId == target_condition);
    return target_items.reverse();
  }
  if (yoked == "across") {
    let target_items = [];
    for (let i = 0; i < 6; i++) {
      let rep_list = [];
      for (let j = 0; j < raw_choices.length; j++) {
        let options = stimuli.filter(
          (item) => item.repNum == i && item.tangram == raw_choices[j]
        );
        shuffle(options);
        let target_item = options[0];
        rep_list.push(target_item);
      }
      shuffle(rep_list);
      target_items = target_items.concat(rep_list);
    }
    return target_items;
  }
}

export function counterbalance(item_types, items) {
  let select_items = [];
  for (let i = 0; i < item_types.length; i++) {
    // for each grouping
    let relevant = items.filter((item) => {
      return item_types[i].includes(item.item_type);
    }); // items of this grouping

    let relevant_ids = [];
    shuffle(relevant_ids);
    relevant.forEach((item) => {
      if (!relevant_ids.includes(item.id)) {
        relevant_ids.push(item.id);
      }
    });
    for (let j = 0; j < item_types[i].length; j++) {
      let item_type = item_types[i][j];
      let frac = relevant_ids.length / item_types[i].length;
      let start = Math.floor(j * frac);
      let end = Math.floor((j + 1) * frac);
      for (let k = start; k < end; k++) {
        let id = relevant_ids[k];
        relevant.forEach((item) => {
          if ((item.id == id) & (item.item_type == item_type)) {
            select_items.push(item);
          }
        });
      }
    }
  }
  shuffle(select_items);
  return select_items;
}
