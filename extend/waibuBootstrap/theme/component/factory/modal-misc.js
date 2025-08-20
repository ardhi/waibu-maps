import wmapsBase from '../wmaps-base.js'

async function modalMisc () {
  const SmapsBase = await wmapsBase.call(this)

  return class SmapsModalMisc extends SmapsBase {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      this.params.html = await this.component.buildSentence(`
        <c:modal id="${this.params.attr.id}" t:title="generalSettings" x-data="{
            measure: $store.map.measure,
            degree: $store.map.degree,
            zoomScrollCenter: $store.map.zoomScrollCenter,
            noMapRotate: $store.map.noMapRotate,
            hideCompass: $store.map.hideCompass,
            submit () {
              $store.map.measure = this.measure
              $store.map.degree = this.degree
              $store.map.zoomScrollCenter = this.zoomScrollCenter
              $store.map.noMapRotate = this.noMapRotate
              $store.map.hideCompass = this.hideCompass
              window.location.reload()
            },
            toggleNoMapRotate (val) {
              if (val) {
                $refs.hideCompass.setAttribute('disabled', '')
                this.hideCompass = false
              } else {
                $refs.hideCompass.removeAttribute('disabled')
              }
            }
          }" x-init="
            toggleNoMapRotate($store.map.noMapRotate)
            $watch('noMapRotate', val => toggleNoMapRotate(val))
          ">
          <c:grid-row>
            <c:grid-col col="6-md">
              <c:fieldset t:legend="measurement" legend-type="6" margin="bottom-3">
                <c:form-radio t:label="nautical" value="nautical" x-model="measure" />
                <c:form-radio t:label="imperial" value="imperial" x-model="measure" />
                <c:form-radio t:label="metric" value="metric" x-model="measure" />
              </c:fieldset>
            </c:grid-col>
            <c:grid-col col="6-md">
              <c:fieldset t:legend="degreeFormat" legend-type="6" margin="bottom-3">
                <c:form-radio t:label="degreeMinuteSecond" value="DMS" x-model="degree" />
                <c:form-radio t:label="decimalDegree" value="DD" x-model="degree" />
              </c:fieldset>
            </c:grid-col>
            <c:grid-col col="12">
              <c:fieldset t:legend="misc" legend-type="6">
                <c:form-check t:label="zoomScrollFromCenter" value="false" x-model="zoomScrollCenter" />
                <c:form-check t:label="disableMapRotation" value="false" x-model="noMapRotate" />
                <c:form-check t:label="hideCompass" value="false" x-model="hideCompass" x-ref="hideCompass"/>
              </c:fieldset>
            </c:grid-col>
          </c:grid-row>
          <c:div flex="justify-content:end" margin="top-3">
            <c:btn color="primary" t:content="apply" @click="submit()"/>
          </c:div>
        </c:modal>
      `)
    }
  }
}

export default modalMisc
