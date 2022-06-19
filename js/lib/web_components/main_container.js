class MainContainer extends HTMLElement {

  constructor () {
    super();
    this.users;
    this.cards;
    this.current_user = {id: 1, name: 'ARYAN'}     //assuming the user id who is accessing the page for now has id as 1 (my self)
    this.filter_params = {owner_id: this.current_user.id, status: ['active','blocked']} //default filter when page loads
  }

  connectedCallback () {
    this.innerHTML = `
      <div class="mb-3">
        <nav class="navbar navbar-expand-lg navbar-light">
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#main-nav" aria-controls="main-nav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse border-bottom" id="main-nav">
            <div class="navbar-nav">
              <a class="nav-item nav-link active mr-2" id="myself" href="#">Your</a>
              <a class="nav-item nav-link mr-2" id="all" href="#">All</a>
              <a class="nav-item nav-link mr-2" id="blocked" href="#">Blocked</a>
            </div>
          </div>
        </nav>
      </div>
      <div id="card-list" class="row container"></div>
      <div class="loader hide"></div>
    `
    this._fetchUsers();
    this._fetchCards({filter_params: this.filter_params});
    this._addEventListeners()
  }

  _addEventListeners(){
    $(this).find('.nav-item').on('click', this.navigatePage.bind(this));
    // $(this).find('.modal-close').on('click', this.closeModal.bind(this));
  }

  _fetchUsers(){
    $.ajax({
      url: `data/user_details.json`,
      method: 'GET',
      dataType: 'json',
      success: (response) => {
        this.users = response.data;
      }
    });
  }
  async _fetchCards(options={}){
    let params = options.filter_params  //this provides the type of cards to be fetched depending upon filters applied
    if (!window.customElements.get("virtual-card")) {
      await $.getScript(`js/lib/web_components/virtual_card.js`, () => {});
    }
    console.log('imitate')
    await this.imitateResponseTime(3000)
    console.log('imitate2')
    $.ajax({
      url: `data/card_details.json`,
      method: 'GET',
      dataType: 'json',
      data: params,
      beforeSend: () => {
      },
      success: (response) => {
        this.cards = response.data
        this.cards = this.getFilteredCards() 
        /* getFilteredCards() function mocks the filter functionality of the backend code. Since API call is not a request sent to the server, hence filteration of the cards has been done from front end to mock the filter feature provided in UI. (This function can be avoided once actual request to the server is implemented.)  */
        if (this.cards.length > 0){
          this.cards.forEach(card => {
            let ce = document.createElement('virtual-card')
            let owner_details = this._getUser(card.owner_id)
            ce.card_details = card
            ce.total_amount = (card.available_to_spend + card.spent.value)
            ce.owner_name = owner_details.name
            $(this).find('#card-list').append(ce)
          });
        }
      },
      complete: () => {

      }
    });
  }

  _getUser (id){
    return this.users.find((e)=> e.id == id)
  }

  navigatePage(e){
    e.preventDefault();
    let $el = $(e.currentTarget)
    if($el.hasClass('active')) return;
    $(this).find('.nav-item').removeClass('active')
    $el.addClass('active')
    let section = $el.attr('id')
    this.filter_params = {status: ['active', 'blocked'], page_size: 10, page: 1}
    switch(section){
      case 'myself':
        this.filter_params['owner_id'] = this.current_user.id
        break;
      case 'all':
        break;
      case 'blocked':
        this.filter_params.status = ['blocked']
        break;
    }
    $(this).find('#card-list').empty()
    this._fetchCards({filter_params: this.filter_params })
  }
  getFilteredCards(){
    let cards = this.cards
    if(this.filter_params['owner_id'])
      cards = cards.filter((card) => card.owner_id == this.filter_params['owner_id'])

    if(this.filter_params['card_type'])
      cards = cards.filter((card) => this.filter_params['card_type'].includes(card.card_type))

    if(this.filter_params['status'] && this.filter_params['status'].length > 0)
      cards = cards.filter((card) => this.filter_params['status'].includes(card.status))
    return cards
  }

  imitateResponseTime(time){
    return new Promise((resolved, reject)=>{
      setTimeout(()=>resolved(time), time)
    })
  }
}
customElements.define("main-container", MainContainer);