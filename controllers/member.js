const express = require("express");
const Router = express.Router();

const vars = require("../const");
// Models
const Member = require("../models/member");
const Payment = require("../models/member-payment");
const Saving = require("../models/saving");
const Release = require("../models/release");
const Center = require("../models/center");
const Log = require("../models/user-log");
const { default: mongoose } = require("mongoose");

Router.get("/member", (req, res) => {
  let page = req.query._page >= 1 ? parseInt(req.query._page) - 1 : 0;
  let limit = vars.DATA_LIMIT
  if (req.query._limit == 'none') limit = 0
  let search = {};
  if (req.query._search && req.query._column) {
    let col = req.query._column;
    let src = req.query._search;
    let options = 'i'

    search = {
      [col]: {
        $regex: src,
        $options: options,
      },
    };

    if (Member.schema.path(col) instanceof mongoose.Schema.Types.Number) {
      search = {
        [col]: parseInt(src),
      };
    }
  }
  if (req.query._center) {
    search = {
      centerId: req.query._center
    }
  }
  let sort = req.query._sort
    ? { [req.query._sort]: req.query._order }
    : { memberName: "ASC" };
  Member.find(search)
    .limit(limit)
    .sort(sort)
    .skip(page * limit)
    .then(async (result) => {
      if (result) {
        return res.status(200).send({
          data: result,
          total: await Member.find(search).countDocuments(),
          success: true,
          message: "Fetched members",
        });
      }

      return res.status(400).send({
        data: {},
        success: false,
        message: "No member",
      });
    });
});

Router.post("/member", (req, res) => {
  let loanBalance =
    parseFloat(req.body.releaseAmount) * 0.2 +
    parseFloat(req.body.releaseAmount) +
    parseFloat(req.body.processingFee ? req.body.processingFee : 0);
  let data = {
    memberName: req.body.memberName,
    lastReleaseDate: req.body.lastReleaseDate,
    lastReleaseAmount: req.body.lastReleaseAmount,
    lastPaymentDate: req.body.lastPaymentDate,
    lastPaymentAmount: req.body.lastPaymentAmount,
    releaseDate: req.body.releaseDate,
    releaseAmount: req.body.releaseAmount,
    savings: req.body.savings,
    cycles: req.body.cycles,
    centerId: req.body.centerId,
    centerName: req.body.centerName,
    balance: loanBalance,
  };
  if (req.body.sameBalanceToggle) {
    data = {
      memberName: req.body.memberName,
      lastReleaseDate: req.body.lastReleaseDate,
      lastReleaseAmount: req.body.lastReleaseAmount,
      lastPaymentDate: req.body.lastPaymentDate,
      lastPaymentAmount: req.body.lastPaymentAmount,
      releaseDate: req.body.releaseDate,
      releaseAmount: req.body.releaseAmount,
      savings: req.body.savings,
      cycles: req.body.cycles,
      centerId: req.body.centerId,
      centerName: req.body.centerName,
      balance: req.body.balance
    };
  }
  Member.findOneAndUpdate(
    {
      _id: req.body.memberId,
    },
    data
  ).then((result) => {
    let logValue = {
      memberName: result.memberName + " => " + req.body.memberName,
      lastReleaseDate:
        result.lastReleaseDate + " => " + req.body.lastReleaseDate,
      lastReleaseAmount:
        result.lastReleaseAmount + " => " + req.body.lastReleaseAmount,
      lastPaymentDate:
        result.lastPaymentDate + " => " + req.body.lastPaymentDate,
      lastPaymentAmount:
        result.lastPaymentAmount + " => " + req.body.lastPaymentAmount,
      releaseDate: result.releaseDate + " => " + req.body.releaseDate,
      releaseAmount: result.releaseAmount + " => " + req.body.releaseAmount,
      savings: result.savings + " => " + req.body.savings,
      cycles: result.cycles + " => " + req.body.cycles,
      centerId: result.centerId + " => " + req.body.centerId,
      centerName: result.centerName + " => " + req.body.centerName,
    };
    if (result) {
      createLogs({
        employeeId: req.body.logEmployeeId,
        employeeName: req.body.logEmployeeName,
        actionValue: JSON.stringify(logValue),
        actionType: "MODIFY_MEMBER",
        date: new Date(),
      });

      return res.status(200).send({
        data,
        success: true,
        message: "Successfully updated member",
      });
    }

    return res.status(400).send({
      data: {},
      success: false,
      message: "Member id does not exist",
    });
  });
});

Router.put("/member", async (req, res) => {
  let loanBalance =
    parseFloat(req.body.releaseAmount) * 0.2 +
    parseFloat(req.body.releaseAmount) +
    parseFloat(req.body.processingFee ? req.body.processingFee : 0);
  const data = {
    memberName: req.body.memberName,
    lastReleaseDate: req.body.lastReleaseDate,
    lastReleaseAmount: req.body.lastReleaseAmount,
    lastPaymentDate: req.body.lastPaymentDate,
    lastPaymentAmount: req.body.lastPaymentAmount,
    releaseDate: req.body.releaseDate,
    releaseAmount: req.body.releaseAmount,
    savings: req.body.savings,
    cycles: req.body.cycles,
    centerId: req.body.centerId,
    centerName: req.body.centerName,
    balance: loanBalance,
  };

  const member = new Member(data);

  await member
    .save()
    .then(() => {
      createLogs({
        employeeId: req.body.logEmployeeId,
        employeeName: req.body.logEmployeeName,
        actionValue: JSON.stringify(member),
        actionType: "CREATE_MEMBER",
        date: new Date(),
      });

      res.status(200).send({
        data: {
          id: member._id.toString(),
        },
        success: true,
        message: "Created a new member",
      });
    })
    .catch(() => {
      return res.status(400).send({
        data: {},
        success: false,
        message: "Member already exist",
      });
    });
});

Router.delete("/member", (req, res) => {
  Member.findOneAndDelete({ _id: req.body.memberId }).then((result) => {
    if (result) {
      createLogs({
        employeeId: req.body.logEmployeeId,
        employeeName: req.body.logEmployeeName,
        actionValue: JSON.stringify(result),
        actionType: "REMOVE_MEMBER",
        date: new Date(),
      });

      return res.status(200).send({
        data: {
          memberId: req.body.memberId,
        },
        success: true,
        message: "Deleted a member",
      });
    }

    return res.status(400).send({
      data: {},
      success: false,
      message: "Member does not exist",
    });
  });
});

Router.get("/payment", (req, res) => {
  let page = req.query._page >= 1 ? parseInt(req.query._page) - 1 : 0;
  let data = {};
  if (req.query.id) {
    data = { memberId: req.query.id };
    if (req.query._search && req.query._column) {
      let col = req.query._column;
      let src = req.query._search;
      let options = 'i'

      data = {
        memberId: req.query.id,
        [col]: {
          $regex: src,
          $options: options,
        },
      };

      if (Payment.schema.path(col) instanceof mongoose.Schema.Types.Number) {
        data = {
          memberId: req.query.id,
          [col]: parseInt(src),
        };
      }
    }
  }
  let sort = req.query._sort
    ? { [req.query._sort]: req.query._order }
    : { paymentDate: "DESC" };
  Payment.find(data)
    .limit(vars.DATA_LIMIT)
    .sort(sort)
    .skip(page * vars.DATA_LIMIT)
    .then(async (result) => {
      if (result) {
        return res.send({
          data: result,
          total: await Payment.find(data).countDocuments(),
          success: true,
          message: "Fetched member payments",
        });
      }

      return res.send({
        data: {},
        success: false,
        message: "Member id does not exist",
      });
    });
});

Router.post("/payment", (req, res) => {
  Payment.findOneAndUpdate(
    {
      _id: req.body.paymentId,
    },
    {
      paymentDate: req.body.paymentDate,
      paymentAmount: req.body.paymentAmount,
      cycle: req.body.cycle,
      balance: req.body.remainingBalance,
    }
  ).then((result) => {
    let logValue = {
      paymentDate: result.paymentDate + " => " + req.body.paymentDate,
      paymentAmount: result.paymentAmount + " => " + req.body.paymentAmount,
      cycle: result.cycle + " => " + req.body.cycle,
      balance: result.remainingBalance + " => " + req.body.remainingBalance,
    };
    if (result) {
      createLogs({
        employeeId: req.body.logEmployeeId,
        employeeName: req.body.logEmployeeName,
        actionValue: JSON.stringify(logValue),
        actionType: "MODIFY_PAYMENT",
        date: new Date(),
      });

      return res.status(200).send({
        data: {
          paymentId: req.body.paymentId,
          paymentDate: req.body.paymentDate,
          paymentAmount: req.body.paymentAmount,
          cycle: req.body.cycle,
          balance: req.body.remainingBalance,
        },
        success: true,
        message: "Successfully updated payment",
      });
    }

    return res.status(400).send({
      data: {},
      success: false,
      message: "Payment id does not exist",
    });
  });
});

Router.put("/payment", (req, res) => {
  Member.findById({ _id: req.body.memberId })
    .then(async (result) => {
      const data = {
        memberId: req.body.memberId,
        paymentDate: req.body.paymentDate,
        paymentAmount: req.body.paymentAmount,
        cycle: req.body.cycle,
        balance: req.body.remainingBalance,
      };

      const payment = new Payment(data);

      await payment.save().then(() => {
        createLogs({
          employeeId: req.body.logEmployeeId,
          employeeName: req.body.logEmployeeName,
          actionValue: JSON.stringify(payment),
          actionType: "CREATE_PAYMENT",
          date: new Date(),
        });

        return res.status(200).send({
          data: {
            id: payment._id.toString(),
          },
          success: true,
          message: "Created a new payment",
        });
      });
    })
    .catch(() => {
      return res.status(400).send({
        data: {},
        success: false,
        message: "Member does not exist",
      });
    });
});

Router.delete("/payment", (req, res) => {
  Payment.findOneAndDelete({ _id: req.body.paymentId }).then((result) => {
    if (result) {
      createLogs({
        employeeId: req.body.logEmployeeId,
        employeeName: req.body.logEmployeeName,
        actionValue: JSON.stringify(result),
        actionType: "REMOVE_PAYMENT",
        date: new Date(),
      });

      return res.status(200).send({
        data: {
          paymentId: req.body.paymentId,
        },
        success: true,
        message: "Deleted a payment",
      });
    }

    return res.status(400).send({
      data: {},
      success: false,
      message: "Payment does not exist",
    });
  });
});

Router.get("/saving", (req, res) => {
  let page = req.query._page >= 1 ? parseInt(req.query._page) - 1 : 0;
  let data = {};
  if (req.query.id) {
    data = { memberId: req.query.id };
    if (req.query._search && req.query._column) {
      let col = req.query._column;
      let src = req.query._search;
      let options = 'i'

      data = {
        memberId: req.query.id,
        [col]: {
          $regex: src,
          $options: options,
        },
      };

      if (Saving.schema.path(col) instanceof mongoose.Schema.Types.Number) {
        data = {
          memberId: req.query.id,
          [col]: parseInt(src),
        };
      }
    }
  }
  let sort = req.query._sort
    ? { [req.query._sort]: req.query._order }
    : { paymentDate: "ASC" };
  Saving.find(data)
    .limit(vars.DATA_LIMIT)
    .sort(sort)
    .skip(page * vars.DATA_LIMIT)
    .then(async (result) => {
      if (result) {
        return res.send({
          data: result,
          total: await Saving.find(data).countDocuments(),
          success: true,
          message: "Fetched member savings",
        });
      }

      return res.send({
        data: {},
        success: false,
        message: "Member id does not exist",
      });
    });
});

Router.post("/saving", (req, res) => {
  Saving.findOneAndUpdate(
    {
      _id: req.body.savingId,
    },
    {
      paymentDate: req.body.paymentDate,
      paymentAmount: req.body.paymentAmount,
      savings: req.body.remainingSavings
    }
  ).then((result) => {
    let logValue = {
      paymentDate: result.paymentDate + " => " + req.body.paymentDate,
      paymentAmount: result.paymentAmount + " => " + req.body.paymentAmount,
      savings: result.savings + " => " + req.body.remainingSavings,
    };
    if (result) {
      createLogs({
        employeeId: req.body.logEmployeeId,
        employeeName: req.body.logEmployeeName,
        actionValue: JSON.stringify(logValue),
        actionType: "MODIFY_SAVING",
        date: new Date(),
      });

      return res.status(200).send({
        data: {
          savingId: req.body.savingId,
          paymentDate: req.body.paymentDate,
          paymentAmount: req.body.paymentAmount,
        },
        success: true,
        message: "Successfully updated savings",
      });
    }

    return res.status(400).send({
      data: {},
      success: false,
      message: "Savings id does not exist",
    });
  });
});

Router.put("/saving", (req, res) => {
  Member.findById({ _id: req.body.memberId })
    .then(async (result) => {
      const data = {
        memberId: req.body.memberId,
        paymentDate: req.body.paymentDate,
        paymentAmount: req.body.paymentAmount,
        savings: req.body.remainingSavings
      };

      const saving = new Saving(data);

      await saving.save().then(() => {
        createLogs({
          employeeId: req.body.logEmployeeId,
          employeeName: req.body.logEmployeeName,
          actionValue: JSON.stringify(saving),
          actionType: "CREATE_SAVING",
          date: new Date(),
        });

        return res.status(200).send({
          data: {
            id: saving._id.toString(),
          },
          success: true,
          message: "Created a new savings",
        });
      });
    })
    .catch(() => {
      return res.status(400).send({
        data: {},
        success: false,
        message: "Member id does not exist",
      });
    });
});

Router.delete("/saving", (req, res) => {
  Saving.findOneAndDelete({ _id: req.body.savingId }).then((result) => {
    if (result) {
      createLogs({
        employeeId: req.body.logEmployeeId,
        employeeName: req.body.logEmployeeName,
        actionValue: JSON.stringify(result),
        actionType: "REMOVE_SAVING",
        date: new Date(),
      });
      return res.status(200).send({
        data: {
          savingId: req.body.savingId,
        },
        success: true,
        message: "Deleted a savings",
      });
    }

    return res.status(400).send({
      data: {},
      success: false,
      message: "Savings does not exist",
    });
  });
});

Router.get("/release", (req, res) => {
  let page = req.query._page >= 1 ? parseInt(req.query._page) - 1 : 0;
  let data = {};
  if (req.query.id) {
    data = { memberId: req.query.id };
    if (req.query._search && req.query._column) {
      let col = req.query._column;
      let src = req.query._search;
      let options = 'i'

      data = {
        memberId: req.query.id,
        [col]: {
          $regex: src,
          $options: options,
        },
      };

      if (Release.schema.path(col) instanceof mongoose.Schema.Types.Number) {
        data = {
          memberId: req.query.id,
          [col]: parseInt(src),
        };
      }
    }
  }
  let sort = req.query._sort
    ? { [req.query._sort]: req.query._order }
    : { releaseDate: "ASC" };
  Release.find(data)
    .limit(vars.DATA_LIMIT)
    .sort(sort)
    .skip(page * vars.DATA_LIMIT)
    .then(async (result) => {
      if (result) {
        return res.send({
          data: result,
          total: await Release.find(data).countDocuments(),
          success: true,
          message: "Fetched releases",
        });
      }

      return res.send({
        data: {},
        success: false,
        message: "No releases",
      });
    });
});

Router.post("/release", (req, res) => {
  Release.findOneAndUpdate(
    {
      _id: req.body.releaseId,
    },
    {
      nextPaymentDate: req.body.nextPaymentDate,
      dailyPayment: req.body.dailyPayment,
      releaseAmount: req.body.releaseAmount,
      releaseDate: req.body.releaseDate,
      releaseOutgoing: req.body.releaseOutgoing,
      processingFee: req.body.processingFee,
      miscellaneousFee: req.body.miscellaneousFee,
      remainingBalance: req.body.remainingBalance,
    }
  ).then((result) => {
    let logValue = {
      releaseAmount: result.releaseAmount + " => " + req.body.releaseAmount,
      releaseDate: result.releaseDate + " => " + req.body.releaseDate,
      releaseOutgoing: result.releaseOutgoing + " => " + req.body.releaseOutgoing,
      processingFee: result.processingFee + " => " + req.body.processingFee,
      miscellaneousFee: result.miscellaneousFee + " => " + req.body.miscellaneousFee,
      remainingBalance: result.remainingBalance + " => " + req.body.remainingBalance,
      nextPaymentDate: result.nextPaymentDate + " => " + req.body.nextPaymentDate,
      dailyPayment: result.dailyPayment + " => " + req.body.dailyPayment,
    };
    if (result) {
      createLogs({
        employeeId: req.body.logEmployeeId,
        employeeName: req.body.logEmployeeName,
        actionValue: JSON.stringify(logValue),
        actionType: "MODIFY_RELEASE",
        date: new Date(),
      });

      return res.status(200).send({
        data: {
          releaseId: req.body.releaseId,
          nextPaymentDate: req.body.nextPaymentDate,
          dailyPayment: req.body.dailyPayment,
        },
        success: true,
        message: "Successfully updated release",
      });
    }

    return res.status(400).send({
      data: {},
      success: false,
      message: "Release id does not exist",
    });
  });
});

Router.put("/release", (req, res) => {
  Member.findById({ _id: req.body.memberId })
    .then(async (result) => {
      const data = {
        memberId: req.body.memberId,
        remainingBalance: req.body.remainingBalance,
        releaseDate: req.body.releaseDate,
        releaseAmount: req.body.releaseAmount,
        releaseOutgoing: req.body.releaseOutgoing,
        nextPaymentDate: req.body.nextPaymentDate,
        dailyPayment: req.body.dailyPayment,
        processingFee: req.body.processingFee,
        miscellaneousFee: req.body.miscellaneousFee,
      };

      const release = new Release(data);

      await release.save().then(() => {
        let newReleaseAmount =
              parseFloat(req.body.releaseOutgoing) * 0.2 +
              parseFloat(req.body.releaseOutgoing)
        console.log(newReleaseAmount)
        Member.findOneAndUpdate(
          {
            _id: req.body.memberId
          }, {
            lastReleaseDate: req.body.releaseDate,
            lastReleaseAmount: req.body.releaseOutgoing,
            releaseAmount: req.body.releaseOutgoing,
            balance: newReleaseAmount
          }
        ).then((update) => {
          console.log(update)
        })
        createLogs({
          employeeId: req.body.logEmployeeId,
          employeeName: req.body.logEmployeeName,
          actionValue: JSON.stringify(release),
          actionType: "CREATE_RELEASE",
          date: new Date(),
        });

        return res.status(200).send({
          data: {
            id: release._id.toString(),
          },
          success: true,
          message: "Created a new release",
        });
      });
    })
    .catch(() => {
      return res.status(400).send({
        data: {},
        success: false,
        message: "Member does not exist",
      });
    });
});

Router.delete("/release", (req, res) => {
  Release.findOneAndDelete({ _id: req.body.releaseId }).then((result) => {
    if (result) {
      createLogs({
        employeeId: req.body.logEmployeeId,
        employeeName: req.body.logEmployeeName,
        actionValue: JSON.stringify(result),
        actionType: "REMOVE_RELEASE",
        date: new Date(),
      });

      return res.status(200).send({
        data: {
          releaseId: req.body.releaseId,
        },
        success: true,
        message: "Deleted a release",
      });
    }

    return res.status(400).send({
      data: {},
      success: false,
      message: "Release does not exist",
    });
  });
});

Router.get("/center/fix", (req, res) => {
  Member.find().then(async (result) => {
    if (!result)
      return res.send({ data: {}, success: false, message: "No members" });

    result.map((member) => {
      let centerName = member.centerName;
      let centerId = member.centerId;
      let memberId = member._id.toString();
      Center.find({ _id: centerId }).then((center) => {
        let newCenterName = center[0].centerName;
        if (newCenterName != centerName) {
          Member.findOneAndUpdate(
            { _id: memberId },
            { centerName: newCenterName }
          ).then((result) => console.log(result));
        }
      });
    });

    return res.send({
      data: {},
      success: true,
      message: "Fixed center names",
    });
  });
});

Router.get("/center", (req, res) => {
  let page = req.query._page >= 1 ? parseInt(req.query._page) - 1 : 0;
  let sort = req.query._sort
    ? { [req.query._sort]: req.query._order }
    : { centerName: "ASC" };
  let search = {};
  if (req.query._search && req.query._column) {
    let col = req.query._column;
    let src = req.query._search;

    search = {
      [col]: {
        $regex: src,
        $options: "i",
      },
    };
  }
  if (req.query._center) {
    search = {
      _id: req.query._center
    }
  }
  let limit = vars.DATA_LIMIT
  if (req.query._limit == 'none') limit = 0
  Center.find(search)
    .limit(limit)
    .sort(sort)
    .skip(page * limit)
    .then(async (result) => {
      if (result) {
        return res.send({
          data: result,
          total: await Center.find(search).countDocuments(),
          success: true,
          message: "Fetched centers",
        });
      }

      return res.send({
        data: {},
        success: false,
        message: "No centers",
      });
    });
});

Router.post("/center", (req, res) => {
  Center.findOneAndUpdate(
    {
      _id: req.body.centerId,
    },
    {
      centerName: req.body.centerName,
      centerLeader: req.body.centerLeader,
    }
  ).then((result) => {
    let logValue = {
      centerName: result.centerName + " => " + req.body.centerName,
      centerLeader: result.centerLeader + " => " + req.body.centerLeader,
    };
    if (result) {
      createLogs({
        employeeId: req.body.logEmployeeId,
        employeeName: req.body.logEmployeeName,
        actionValue: JSON.stringify(logValue),
        actionType: "MODIFY_CENTER",
        date: new Date(),
      });

      return res.status(200).send({
        data: {
          centerId: req.body.centerId,
          centerName: req.body.centerName,
          centerLeader: req.body.centerLeader,
        },
        success: true,
        message: "Successfully updated center",
      });
    }

    return res.status(400).send({
      data: {},
      success: false,
      message: "Center id does not exist",
    });
  });
});

Router.put("/center", async (req, res) => {
  const data = {
    centerName: req.body.centerName,
    centerLeader: req.body.centerLeader,
  };

  const center = new Center(data);

  await center.save().then(() => {
    createLogs({
      employeeId: req.body.logEmployeeId,
      employeeName: req.body.logEmployeeName,
      actionValue: JSON.stringify(center),
      actionType: "CREATE_CENTER",
      date: new Date(),
    });

    return res.status(200).send({
      data: {
        id: center._id.toString(),
      },
      success: true,
      message: "Created a new center",
    });
  });
});

Router.delete("/center", (req, res) => {
  Center.findOneAndDelete({ _id: req.body.centerId }).then((result) => {
    if (result) {
      createLogs({
        employeeId: req.body.logEmployeeId,
        employeeName: req.body.logEmployeeName,
        actionValue: JSON.stringify(result),
        actionType: "REMOVE_CENTER",
        date: new Date(),
      });

      return res.status(200).send({
        data: {
          centerId: req.body.centerId,
        },
        success: true,
        message: "Deleted a center",
      });
    }

    return res.status(400).send({
      data: {},
      success: false,
      message: "Center does not exist",
    });
  });
});

Router.get("/balance", (req, res) => {
  Member.findOne({ _id: req.query.id }).then((member) => {
    return res.send({
      data: {
        balance: member.balance,
      },
      success: true,
      message: "Fetched member balance",
    });
  });
});

Router.put("/balance", (req, res) => {
  Member.findOneAndUpdate(
    {
      _id: req.body.memberId,
    },
    {
      lastPaymentAmount: parseFloat(req.body.paymentAmount),
      lastPaymentDate: req.body.paymentDate,
      balance: parseFloat(req.body.remainingBalance),
    }
  ).then((result) => {
    if (result) {
      return res.send({
        data: result,
        success: true,
        message: "Updated balance",
      });
    }

    return res.send({
      data: {},
      success: false,
      message: "Something went wrong",
    });
  });
});

Router.get("/savings", (req, res) => {
  Member.findOne({ _id: req.query.id }).then((member) => {
    return res.send({
      data: {
        savings: member.savings,
      },
      success: true,
      message: "Fetched member savings",
    });
  });
});

Router.put("/savings", (req, res) => {
  Member.findOneAndUpdate(
    {
      _id: req.body.memberId,
    },
    {
      savings: parseFloat(req.body.remainingSavings),
    }
  ).then((result) => {
    if (result) {
      return res.send({
        data: result,
        success: true,
        message: "Updated savings",
      });
    }

    return res.send({
      data: {},
      success: false,
      message: "Something went wrong",
    });
  });
});

function createLogs(received) {
  new Log({
    employeeId: received.employeeId,
    employeeName: received.employeeName,
    actionValue: received.actionValue,
    actionType: received.actionType,
    actionDate: new Date(received.date).toLocaleDateString('en-US', { year: "numeric", month: "long", day: "numeric" }),
    actionTime: new Date(received.date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
    timestamp: Date.now()
  }).save();
}

module.exports = Router;
