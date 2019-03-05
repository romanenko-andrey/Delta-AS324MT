Vue.component('line-koeff', {
  props: ['offset', 'step'],
  template: `
    <div>
      <input 
        class="analog-input" type="number" 
        v-bind:step="step" 
        v-bind:value="offset"
        v-on:input="$emit('input', $event.target.value)"
      > 
      <b-button 
        size="sm" variant="success" title="Save all"
        @click="$emit('save-all')">
        <i class="fa fa-check"></i>
      </b-button>
    </div>
  `,
  methods: {
  
    setBkColor: function(){
      return {
        background: this.output.state == '1' ? 'green' : 'gray'
      };
    }
  }
});