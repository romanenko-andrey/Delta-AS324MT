Vue.component("digital-output", {
	props: ["output"],
	template: `
    <div class="grid-item" :title="output.title">
  		<div class="grid-cell--top" :style="setBkColor()">
				<span
					v-text="output.name"
					:class="{ bounce: output.state == '1' }"
				></span>
      </div>
      <!--
			<div class="grid-cell--bottom" :style="setColor()">
				{{ output.title }}
      </div>
      -->
		</div>
  `,
  methods: {
    setBkColor: function(){
      return {
        background: this.output.state == '1' ? 'green' : 'gray'
      }
    },
    setBorderColor: function(){
      var border_class = ' 3px dotted';
      return {
        border: this.output.command == 'on'  ? 'green' + border_class :
                this.output.command == 'off' ? 'black' + border_class :
                                               'white' + border_class
      }
    }
  }
})