import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const SALT_WORK_FACTOR: number = 15;
const Schema = mongoose.Schema;
const UserSchema: any = new Schema({
  birthDate: {
    default: '',
    type: Date,
  },
  email: {
    required: true,
    trim: true,
    type: String,
    unique: true,
  },
  name: {
    default: '',
    trim: true,
    type: String,
  },
  password: {
    required: true,
    trim: true,
    type: String,
  },
  userId: {
    trim: true,
    type: String,
    unique: true,
  },
  username: {
    required: true,
    trim: true,
    type: String,
    unique: true,
  },
});

UserSchema.pre('save', function(next: any) {
  const user: any = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) { return next(); }

  bcrypt.genSalt(SALT_WORK_FACTOR, function(errGenSalt, salt) {
    if (errGenSalt) { return next(errGenSalt); }

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function(errHash, hash) {
      if (errHash) { return next(errHash); }

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function(candidatePassword: string, callback: any) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
      callback(err, null);
    }
    callback(null, isMatch);
  });
};

UserSchema.methods.encryptPassword = function(plainTextPassword: string, callback: any) {
  if (!plainTextPassword) { callback(null, ''); }

  bcrypt.genSalt(SALT_WORK_FACTOR, function(errGenSalt, salt) {
    if (errGenSalt) { callback(errGenSalt, null); }

    // hash the password using our new salt
    bcrypt.hash(plainTextPassword, salt, function(errHash, hash) {
      if (errHash) { callback(errHash, null); }

      callback(null, hash);
    });
  });
};

const User = mongoose.model('User', UserSchema);

export default User;
