define(function() {
  var Sha1 = {};
  var hexcase = 0;
  var chrsz = 8;
  Sha1.hex_sha1 = function(s) {
    return this.binb2hex(core_sha1(AlignSHA1(s)));
  }
  Sha1.sha1_vm_test = function() {
    return this.hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
  }
  Sha1.core_sha1 = function(blockArray) {
    var x = blockArray;
    var w = Array(80);
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;
    var e = -1009589776;
    for (var i = 0; i < x.length; i += 16) // 每次处理512位 16*32
    {
      var olda = a;
      var oldb = b;
      var oldc = c;
      var oldd = d;
      var olde = e;
      for (var j = 0; j < 80; j++) // 对每个512位进行80步操作
      {
        if (j < 16)
          w[j] = x[i + j];
        else
          w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
        var t = this.safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)), this.safe_add(
            this.safe_add(e, w[j]), sha1_kt(j)));
        e = d;
        d = c;
        c = rol(b, 30);
        b = a;
        a = t;
      }
      a = this.safe_add(a, olda);
      b = this.safe_add(b, oldb);
      c = this.safe_add(c, oldc);
      d = this.safe_add(d, oldd);
      e = this.safe_add(e, olde);
    }
    return new Array(a, b, c, d, e);
  }
  /*
   * 返回对应F函数的值
   */
  Sha1.sha1_ft = function(t, b, c, d) {
    if (t < 20)
      return (b & c) | ((~b) & d);
    if (t < 40)
      return b ^ c ^ d;
    if (t < 60)
      return (b & c) | (b & d) | (c & d);
    return b ^ c ^ d; // t<80
  }
  /*
   * 返回对应的Kt值
   */
  Sha1.sha1_kt = function(t) {
    return (t < 20) ? 1518500249 : (t < 40) ? 1859775393
        : (t < 60) ? -1894007588 : -899497514;
  }
  /*
   * 将32位数拆成高16位和低16位分别进行相加，从而实现 MOD 2^32 的加法
   */
  Sha1.safe_add = function(x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }
  /*
   * 32位二进制数循环左移
   */
  Sha1.rol = function(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  Sha1.AlignSHA1 = function(str) {
    var nblk = ((str.length + 8) >> 6) + 1, blks = new Array(nblk * 16);
    for (var i = 0; i < nblk * 16; i++)
      blks[i] = 0;
    for (i = 0; i < str.length; i++)
      blks[i >> 2] |= str.charCodeAt(i) << (24 - (i & 3) * 8);
    blks[i >> 2] |= 0x80 << (24 - (i & 3) * 8);
    blks[nblk * 16 - 1] = str.length * 8;
    return blks;
  }
  Sha1.binb2hex = function(binarray) {
    var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var str = "";
    for (var i = 0; i < binarray.length * 4; i++) {
      str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF)
          + hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
    }
    return str;
  }
  Sha1.calcDigest = function() {
    var digestM = this.hex_sha1(document.SHAForm.SourceMessage.value);
    document.SHAForm.MessageDigest.value = digestM;
  }

  return Sha1;
});