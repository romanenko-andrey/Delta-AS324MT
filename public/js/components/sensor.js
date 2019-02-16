/* in HTML
<!---
<app-nav></app-nav>
<app-view>
  <app-sidebar></app-sidebar>
  <app-content></app-content>
</app-view>
-->
*/

// Определяем новый компонент под именем sensor-item
Vue.component('sensor-item', {
  // Компонент sensor-item принимает "props", то есть входные параметры.
  // Имя входного параметра val.
  props: ['sensor'],
  template: '<li>{{ sensor.id }} : {{ sensor.value }} : {{ sensor.name }}</li>'
});


Vue.component('sensor-id', {
  props: ['sensorID'],
  template: '<b-col>{{ sensorID }}</b-col>'
});

Vue.component('sensor-value', {
  props: ['sensorValue'],
  template: '<b-col>{{ sensorValue }}</b-col>'
});

Vue.component('sensor-line2', {
  props: ['sensor'],
  template: '<sensor-id v-bind:sensorID=\'sensor.id\'></sensor-id> <sensor-value v-bind:sensorValue=\'sensor.value\'></sensor-value>'
  
});

Vue.component('sensor-line', {
  props: ['sensor'],
  template: `<b-row v-bind:title=sensor.title>
               <b-col cols="2" class="sensor-line sensor-id">{{ sensor.id }}</b-col> 
               <b-col cols="2" class="sensor-line sensor-value">{{ sensor.value }}</b-col> 
               <b-col class="sensor-line sensor-name">{{ sensor.name }}</b-col> 
            </b-row>`
});
