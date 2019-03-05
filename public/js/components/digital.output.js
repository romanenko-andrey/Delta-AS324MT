Vue.component('digital-output', {
  props: ['output'],
  template: `
    <div class="grid-item" :title="output.title">
  		<div class="grid-cell--top" :style="setBkColor()">
				<span
					v-text="output.name"
					:class="{ bounce: output.state == '1' }"
				></span>
      </div>
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