const modalControls = {
  handler: async function (params = {}) {
    params.noTag = true
    // TODO: custom store keys
    params.html = await this.buildSentence(`
      <c:modal id="${params.attr.id}" t:title="Controls Setting" size="sm">
        <c:form-switch t:label="Navigation" value="true" x-data x-model="$store.controlNavigation.on" />
        <c:form-switch t:label="Map Scale" value="true" x-data x-model="$store.controlScale.on" />
        <c:form-switch t:label="Mouse Position" value="true" x-data x-model="$store.controlMousePosition.on" />
        <c:form-switch t:label="Ruler Measurement" value="true" x-data x-model="$store.controlRuler.on" />
        <c:form-switch t:label="Geolocate" value="true" x-data x-model="$store.controlGeolocate.on" />
        <c:form-switch t:label="Attribution" value="true" x-data x-model="$store.controlAttribution.on" />
        <c:form-switch t:label="Center Position" value="true" x-data x-model="$store.controlCenterPosition.on" />
      </c:modal>
    `)
  }
}

export default modalControls
