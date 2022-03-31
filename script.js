const Modal = {
  open() {
    // adiciona uma classe active a div.modal-overlay
    document.querySelector('.modal-overlay ').classList.add('active')
  },
  close() {
    // remove a classe active a div.modal-overlay
    document.querySelector('.modal-overlay ').classList.remove('active')
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
  },
  set(transactions) {
    localStorage.setItem(
      'dev.finances:transactions',
      JSON.stringify(transactions)
    )
  }
}

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)
    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1)

    App.reload()
  },

  //somar as entradas
  incomes() {
    let income = 0

    Transaction.all.forEach(transaction => {
      // percorrendo o array transactions com o forEach e aplicando uma arrow function que verifiaca se o valor do atributo amount do obj transaction é maior que zero, caso essa condição seja verdadeira a variavel será incrementada com o proprio valor do atributo verificado no momento
      if (transaction.amount > 0) {
        income += transaction.amount
      }
    })

    return income
  },

  //somar as saídas
  expenses() {
    let expense = 0

    Transaction.all.forEach(transaction => {
      // percorrendo o array transactions com o forEach e aplicando uma arrow function que verifiaca se o valor do atributo amount do obj transaction é menor que zero, caso essa condição seja verdadeira a variavel será decrementada com o proprio valor do atributo verificado no momento
      if (transaction.amount < 0) {
        expense += transaction.amount
      }
    })

    return expense
  },

  //entradas - saídas
  total() {
    return Transaction.incomes() + Transaction.expenses()
  }
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr') // está criando uma tag tr e sendo atribuida a uma variavel declarada com mesmo nome (tr)
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? 'income' : 'expense' // atribui uma classe income ou expense dependendo do valor do atributo amount do objeto transactions

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" />
      </td>
       
    `
    return html
  },

  updateBalance() {
    document.querySelector('#incomeDisplay').innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    )

    document.querySelector('#expenseDisplay').innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    )

    document.querySelector('#totalDisplay').innerHTML = Utils.formatCurrency(
      Transaction.total()
    )
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ''
  },

  colorTotal() {
    if (Transaction.total() < 0) {
      return document.querySelector('.card.total').classList.add('loss')
    } else {
      return document.querySelector('.card.total').classList.remove('loss')
    }
  }
}

const Utils = {
  formatAmount(value) {
    value = value * 100

    return Math.round(value)
  },

  formatDate(date) {
    const splittedDate = date.split('-')
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : '' // se o numero for menor que zero (negativo) adicione o sinal de menos -, se não não acdicione nada.
    value = String(value).replace(/\D/g, '') // replace está usando expressão regular para substituir tudo que não é numero (/\D/g) por nda (uma string vazia)

    value = Number(value) / 100

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

    return signal + value
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),
  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },
  validateFields() {
    let { description, amount, date } = Form.getValues()

    if (
      description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === ''
    ) {
      throw new Error('Por favor, preecha todos os campos')
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },

  clearFields() {
    Form.description.value = ''
    Form.amount.value = ''
    Form.date.value = ''
  },

  submit(event) {
    event.preventDefault()

    try {
      Form.validateFields() //verifica se os campos estão validos

      const transaction = Form.formatValues() // pega a transação formatada

      Transaction.add(transaction) //adiciona a transação

      Form.clearFields() // limpa os fields do formulario

      Modal.close() // feha o modal (janela com formulario)
    } catch (error) {
      alert(error.message)
    }
  }
}

const DarkMode = {
  darkColors() {
    let body = document.getElementById('body')
    let header = document.getElementById('header')
    let footer = document.getElementById('footer')
    let incomes = document.getElementById('incomes')
    let expenses = document.getElementById('expenses')
    let rowHeader = document.getElementById('row-header')

    console.log(body)

    if (body.classList.contains('dark-body')) {
      body.classList.remove('dark-body')
      footer.classList.remove('dark-body')
      header.classList.remove('dark-header')
      incomes.classList.remove('dark-card')
      expenses.classList.remove('dark-card')
      rowHeader.classList.remove('dark-card')
    } else {
      body.classList.add('dark-body')
      footer.classList.add('dark-body')
      header.classList.add('dark-header')
      incomes.classList.add('dark-card')
      expenses.classList.add('dark-card')
      rowHeader.classList.add('dark-card')
    }
  }
}

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index)
    })

    DOM.updateBalance()

    Storage.set(Transaction.all)

    console.log(Transaction.total())
    DOM.colorTotal()
  },

  reload() {
    DOM.clearTransactions()
    App.init()
  }
}

DarkMode.darkColors()

App.init()
