Vue.component('set-digital-value', {
  props: ['digitalValue', 'min', 'max' , 'step'],
  template: `
    <div>
      <b-button 
            size     = "sm"
            variant  = "info"
            title    = "Fill value"
        v-on:click   = "$emit('fill')">
        <i   class   = "fa fa-share"></i>
      </b-button>

      <input 
            class    = "analog-input"
            type     = "number"
      v-bind:value   = "digitalValue"
      v-bind:min     = "0"
      v-bind:max     = "32767"
      v-bind:step    = "0.1"
        placeholder  = "no change"
        v-on:input   = "$emit('input', $event.target.value)"
      >

      <b-button 
            size     = "sm"
            variant  = "success"
            title    = "Set"
        v-on:click   = "$emit('send')">
        <i   class   = "fa fa-check"></i>
      </b-button>

      <b-button 
            size     = "sm"
            variant  = "danger"
            title    = "Clear"
        v-on:click   = "$emit('clear')">
        <i   class   = "fa fa-eraser"></i>
      </b-button>
    </div>
  `
});

