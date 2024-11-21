class ApiFeatures {
    constructor(query, querystr) {
        this.query = query;
        this.querystr = querystr;
    }

    filter() {
        let queryString = JSON.stringify(this.querystr);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        const querObj = JSON.parse(queryString);
        this.query = this.query.find(querObj);
        return this;
    }

    sort() {
        if (this.querystr.sort) {
            const sortFields = this.querystr.sort.split(',').join(' ');
            this.query = this.query.sort(sortFields);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if (this.querystr.fields) {
            const fields = this.querystr.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select("-__v");
        }
        return this;
    }

    paginate() {
        const page = this.querystr.page * 1 || 1;
        const limit = this.querystr.limit * 1 || 4;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = ApiFeatures;
