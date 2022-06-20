class MainContainer extends HTMLElement {

  PAGE_SIZE = 10

  constructor () {
    super();
    this.users;
    this.cards;
    this.current_user = {id: 1, name: 'ARYAN GUPTA'}     //assuming the user id who is accessing the page for now has id as 1 (my self)
    this.filter_params = {owner_id: this.current_user.id, status: ['active','blocked'], page_size: this.PAGE_SIZE, page: 1 } //default filter when page loads
    /* below variables are used to imitate api request */
    this.is_request_pending  = false;
    this.has_more            = true
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
      <div class="filter-section py-4 row container justify-content-end align-items-center">
        <span class="pointer  mr-3 text-muted" data-target="#filter-name-modal" data-toggle="modal" data-placement="bottom"><i class="fa-solid fa-magnifying-glass mr-2"></i></span>
        <div class="modal custom-modal" id="filter-name-modal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                  <div class="text-gray">Filter</div>
                  <button class="close" data-dismiss="modal">&times;</button>
              </div>
              <div class="modal-body">
                <div>
                  <div class="form-group">
                    <label for="search-name" class="text-md-light">Card Name</label>
                    <input type="text" class="form-control" id="search-name" aria-describedby="search-name" placeholder="Search by card name">
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn-danger col mr-4" id="search">Search</button>
                <button class="btn btn-secondary col shadow" id='clear-search' >Clear</button>
              </div>
            </div>
          </div>
        </div>

        <span class="pointer filter" data-target="#filter-modal" data-toggle="modal" data-placement="bottom"><i class="fa-solid fa-filter mr-2"></i>Filter</span>
        <div class="modal custom-modal" id="filter-modal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                  <div class="text-gray">Search</div>
                  <button class="close" data-dismiss="modal">&times;</button>
              </div>
              <div class="modal-body">
                <div class="text-md-light font-wt-bold-lt mb-3">Type</div>
                <div class="mb-4">
                  <div class="form-check form-check-inline mr-5">
                    <input type="checkbox" class="form-check-input card-type" id="subscription" name="subscription" value="subscription">
                    <label class="form-check-label" for="subscription">Subscription</label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input type="checkbox" class="form-check-input card-type" id="burner" name="burner" value="burner">
                    <label class="form-check-label" for="burner">Burner</label>
                  </div>
                </div>
                <div class="text-md-light font-wt-bold-lt mb-3">Card Holder</div>
                <select class="form-select" id="users-list" aria-label="Disabled select example">
                </select>
              </div>
              <div class="modal-footer">
                <button class="btn btn-danger col mr-4" id="apply-filter">Apply</button>
                <button class="btn btn-secondary col shadow" id='clear-filter' >Clear</button>
              </div>
            </div>
          </div>
        </div>

      </div>
      <div id="card-list" class="row container overflow-auto" style="height: calc(100vh - 295px)!important; margin: auto;"></div>
    `
    $('.curent-user').text('Login As: ' + this.current_user.name)
    this._fetchUsers();
    this._fetchCards({filter_params: this.filter_params});
    this._addEventListeners()
  }

  _addEventListeners(){
    $(this).find('.nav-item').on('click',     this.navigatePage.bind(this));
    $(this).find('#card-list').on('scroll',   this.checkScroll.bind(this));
    $(this).find('#apply-filter').on('click', this.applyFilter.bind(this));
    $(this).find('#clear-filter').on('click', this.resetFilter.bind(this));
    $(this).find('#search').on('click',       this.applyNameFilter.bind(this));
    $(this).find('#search-name').on('keyup',       this.applyNameFilter.bind(this));
    $(this).find('#clear-search').on('click', this.resetNameFilter.bind(this));
  }

  _fetchUsers(){
    $.ajax({
      url: `data/user_details.json`,
      method: 'GET',
      dataType: 'json',
      success: (response) => {
        this.users = response.data;
        this.initializeSelect(this.users);
      }
    });
  }

  initializeSelect(users){
    let $el = $(this).find('#users-list')
    $el.empty()
    let options = ['<option selected value=null>Select Cardholder</option>']
    users.forEach((user)=>{
      options.push(`<option value=${user.id}>${user.name}</option>`)
    })
    $el.html(options.join(''));
    if($(this).find('.nav-item.active').attr('id') == 'myself'){
      $(this).find(`option[value=${this.current_user.id}]`).attr('selected',true)
      $el.attr('disabled',true)
    } else $el.removeAttr('disabled')
  }

  async _fetchCards(options={}){
    let params = options.filter_params || this.filter_params  //this provides the type of cards to be fetched depending upon filters applied
    if (!window.customElements.get("virtual-card")) {
      await $.getScript(`js/lib/web_components/virtual_card.js`, () => {});
    }
    if($('.spinner').length==0) $(this).find('#card-list').append('<div class="spinner" style="margin:auto"><div class="loader"></div><div class="my-5"></div></div>')

    if(!this.is_request_pending){
      await this.imitateResponseTime(3000).then((e)=>{this.is_request_pending = false})
      $.ajax({
        url: `data/card_details.json`,
        method: 'GET',
        dataType: 'json',
        data: params,
        beforeSend: () => {
        },
        success: (response) => {
          $(this).find('.spinner').remove()
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
          $(this).find('.spinner').remove()
          $(this).find('#apply-filter').removeClass('disabled').attr('disabled', false)
          $(this).find('#search').removeClass('disabled').attr('disabled', false)
        }
      });
    }
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
    this.filter_params = {status: ['active', 'blocked'], page_size: this.PAGE_SIZE, page: 1}
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
    this.resetFilter()
    this.resetNameFilter()
    this.initializeSelect(this.users)
    this._fetchCards()
  }

  checkScroll(e){
    let total_height = e.currentTarget.scrollHeight
    let current_position = e.currentTarget.scrollTop + e.currentTarget.clientHeight
    if(total_height-20 <= current_position && !this.is_request_pending && this.has_more){
      this.filter_params['page']+=1
      this._fetchCards()
    }
  }

  getFilteredCards(){
    let cards = this.cards
    let filtered_cards = [];
    if(this.filter_params['owner_id'])
      cards = cards.filter((card) => card.owner_id == this.filter_params['owner_id'])

    if(this.filter_params['card_type'])
      cards = cards.filter((card) => this.filter_params['card_type'].includes(card.card_type))

    if(this.filter_params['status'] && this.filter_params['status'].length > 0)
      cards = cards.filter((card) => this.filter_params['status'].includes(card.status))

    if(this.filter_params['card_name'])
      cards = cards.filter((card) => card['name'].search(new RegExp(this.filter_params['card_name'],'i'))!=-1)

    filtered_cards = cards.slice((this.filter_params.page-1)*this.filter_params.page_size, this.filter_params.page*this.filter_params.page_size) //returns paginated data
    /* setting has_more */
    if(filtered_cards.length==0 && $('virtual-card').length==0)
      this.renderEmptyState()
    this.has_more = cards.slice(this.filter_params.page*this.filter_params.page_size, (this.filter_params.page+1)*this.filter_params.page_size).length>0 ? true: false
    return filtered_cards
  }

  applyFilter(e){
    $(e.currentTarget).addClass('disabled').attr('disabled', true)
    this.filter_params.page = 1
    if($('.card-type:checked').length>0){
      this.filter_params['card_type'] = []
      $('.card-type:checked').each((index,e)=>{
        this.filter_params['card_type'].push($(e).val())
      })
    }else delete this.filter_params['card_type']

    if(!($(this).find("#users-list[disabled]").length>0 &&  $(this).find("#users-list").find('option:selected').val()!="null")){
      this.filter_params['owner_id'] = parseInt($(this).find("#users-list").find('option:selected').val())
    }
    else{
      if($(this).find('.nav-item.active').attr('id')=='myself')
        this.filter_params['owner_id'] = this.current_user.id
      else
        delete this.filter_params['owner_id']
    }
    if(!this.is_request_pending){
      $(this).find('#card-list').empty()
      this._fetchCards()
    }
  }

  applyNameFilter(e){
    e.preventDefault()
    if(this.is_request_pending) return;
    let text = $(this).find('#search-name').val()
    text = text && text.trim()
    if(text!=''){
      this.filter_params['card_name'] = text
    }else delete this.filter_params['card_name']
    if(e.type == 'keyup') return
    $(e.currentTarget).addClass('disabled').attr('disabled', true)
    this.filter_params.page = 1
    $(this).find('#card-list').empty()
    this._fetchCards()
  }

  resetFilter(e){
    if(this.is_request_pending) return;
    if(!($(this).find("#users-list[disabled]").length>0)) this.initializeSelect(this.users)
    $(this).find('.card-type').prop('checked',false);
    delete this.filter_params['card_type']
    $(this).find('#card-list').empty()
    if(e) this._fetchCards()
  }

  resetNameFilter(e){
    if(this.is_request_pending) return;
    delete this.filter_params['card_name']
    $(this).find('#search-name').val('')
    $(this).find('#card-list').empty()
    if(e) this._fetchCards()
  }

  imitateResponseTime(time){
    return new Promise((resolved, reject)=>{
      this.is_request_pending = true
      setTimeout(()=>resolved(false), time)
    })
  }
  renderEmptyState(){
    $(this).find('#card-list').html(`<div class="empty-state card-footer hide"><h1 class="text-md-light">Opps! There are no cards available you are looking for.</h1></div>`)
  }
}
customElements.define("main-container", MainContainer);