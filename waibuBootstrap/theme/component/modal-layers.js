const modalLayers = {
  handler: async function (params = {}) {
    params.noTag = true
    params.html = await this.buildSentence(`
      <c:modal id="${params.attr.id}" t:title="Layers Setting" size="sm" no-padding>
        <c:accordion no-border>
          <c:accordion-item t:header="Basemap" show-on-start>
          test
          </c:accordion-item>
          <c:accordion-item t:header="Overlays">
          test
          </c:accordion-item>
        </c:accordion>
      </c:modal>
    `)
  }
}

export default modalLayers
