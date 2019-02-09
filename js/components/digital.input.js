Vue.component('"digital-input', {
  props: ['input'],
  template: `
		<div class="grid-item" :title="input.title">
			<div class="grid-cell--round" :style="setColor()">
				<span
					v-text="input.id.substr(2,2)"
					:class="{ bounce: input.state == '1' }"
				></span>
      </div>
    </div>
  `,
  methods: {
    setColor: function(){
      return {
        background: this.input.state == '1' ? 'red' : 'gray'
      };
    }
  }
});