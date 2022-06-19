class VirtuaCard extends HTMLElement {

  CARD_TYPE = {
    'burner': 'images/fire.jpeg',
    'subscription': 'images/recycle.jpeg'
  }

  constructor () {
    super();
    this.card_details;
    this.total_amount;
    this.owner_name;
  }

  connectedCallback () {
    this.innerHTML = `
      <div">
        <div class="card shadow">
          <div class="card-body">
            <div class="align-items-center d-flex justify-content-between">
              <div class="d-block">
                <h4 class="card-title">${this.card_details.name}</h4>
                <h6 class="text-muted">
                  <span class="d-flex">
                    <span>${this.owner_name}</span>
                    <ul class="ml-n3"><li>${this.card_details.budget_name}</li></ul>
                  </span>
                </h6>
              </div>
              <div class="icon-overlay rounded-pill">
                <img src="${this.CARD_TYPE[this.card_details.card_type]}" class="rounded float-right rounded-circle shadow img-fluid" alt="xx" >
              </div>
            </div>
            <h6 class="mb-3">
              <span class="badge badge-gray">${this.card_details.card_type}</span>
              ${(this.card_details.card_type == 'subscription') ?
                `<span class="float-right text-muted">${moment(this.card_details.expiry).format('MMMM')} Limit: ${this.card_details.limit} ${this.card_details.spent.currency} </span>`
                : `<span class="float-right text-muted"> Expires: ${moment(this.card_details.expiry).format('DD MMM')}</span>
              `}
            </h6>
            <div class="progress mb-3" style="border-radius: 23px; height: 0.75rem">
              <div class="progress-bar bg-danger" role="progressbar" style="width: ${(this.card_details.spent.value/this.total_amount)*100}%" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100"></div>
              <div class="progress-bar bg-success" role="progressbar" style="width: ${(this.card_details.available_to_spend/this.total_amount)*100}%" aria-valuenow="15" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <div class="text-black-50 h5">
              <ul class="ml-n4">
                <div class="d-flex justify-content-between align-items-center ">
                  <li class="color-danger custom"><span class="text-black-50">Spent</span></li>
                  <span >${this.card_details.spent.value + ' ' + this.card_details.spent.currency}</span>
                </div>
              </ul>
            </div>
            <div class="text-black-50 h5">
              <ul class="ml-n4">
                <div class="d-flex justify-content-between align-items-center ">
                  <li class="color-success custom"><span class="text-black-50">Available to spend</span></li>
                  <span >${this.card_details.available_to_spend + ' ' + this.card_details.spent.currency}</span>
                </div>
              </ul>
            </div>
            <div>
              <span class=" float-right badge badge-${this.card_details.status=='active'? "success": 'danger'}">${this.card_details.status}</span>
            </div>
          </div>
        </div>
      </div>
    `
    $(this).addClass('col-md-6 mb-5');
  }
}
customElements.define("virtual-card", VirtuaCard);