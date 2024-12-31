const express=require('express');
const mailSender=require('../utils/mailSender');

const {auth}=require('../middleware/auth');
const router=express.Router();

submitQuery = async (req, res) => {
    try {
      const { name, email, phone, message } = req.body;
  
      // Validate input
      if (!name || !email || !phone || !message) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

        // Save query to database
        // await queries.create({
        //     name,
        //     email,
        //     phone,
        //     message
        // });
  

      // Send confirmation email to user
      await mailSender(
        email,
        'Query Received - Industrial Goods',
        `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1a73e8; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; border: 1px solid #ddd; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Thank You for Contacting Us</h2>
              </div>
              <div class="content">
                <p>Dear ${name},</p>
                <p>We have received your query and will get back to you shortly.</p>
                <p>Your query details:</p>
                <p>${message}</p>
                <p>Best regards,<br>D.S. Enterprise Team</p>
              </div>
            </div>
          </body>
        </html>
        `
      );
  
      // Send notification to admin
      await mailSender(
        process.env.ADMIN_EMAIL,
        'New Query Received - D.S. Enterprise',
        `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
              .header { background: linear-gradient(45deg, #1a237e, #0d47a1); padding: 30px; text-align: center; }
              .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
              .content { padding: 30px; background: #f8f9fa; }
              .query-details { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .detail-row { margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
              .label { color: #666; font-weight: bold; margin-bottom: 5px; }
              .value { color: #333; }
              .message-box { background: #f8f9fa; padding: 15px; border-left: 4px solid #1a237e; margin-top: 20px; }
              .footer { background: #1a237e; color: white; padding: 20px; text-align: center; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Query Received</h1>
              </div>
              
              <div class="content">
                <div class="query-details">
                  <div class="detail-row">
                    <div class="label">From</div>
                    <div class="value">${name}</div>
                  </div>
                  <div class="detail-row">
                    <div class="label">Email</div>
                    <div class="value">${email}</div>
                  </div>
                  <div class="detail-row">
                    <div class="label">Phone</div>
                    <div class="value">${phone}</div>
                  </div>
                  <div class="message-box">
                    <div class="label">Message</div>
                    <div class="value">${message}</div>
                  </div>
                </div>
              </div>
      
              <div class="footer">
                <p>D.S. Enterprise - One Step Solution</p>
                <p>23 Anandkun App, Opp Kothari Tower, Ramnagar Sabarmati, Ahmedabad - 380005</p>
                <p>📞 +91 84011 24253 | ✉️ dsent121191@gmail.com</p>
              </div>
            </div>
          </body>
        </html>
        `
      );
  
      res.status(201).json({
        success: true,
        message: 'Query submitted successfully'
      });
  
    } catch (error) {
      console.error('Contact submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Error submitting query'
      });
    }
  };

router.post('/submit-query',submitQuery);

// router.get('/get-queries',auth,async(req,res)=>{
//     try{
//         const queries=await queries.findAll();
//         res.json(queries);
//     }catch(err){
//         console.error('Error fetching queries:',err);
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching queries'
//         });
//     }
// })


// router.post('/resolve-query',auth,async(req,res)=>{
//     try{
//         const {queryId}=req.body;
//         const query=await queries.findByPk(queryId);
//         if(!query){
//             return res.status(404).json({
//                 success: false,
//                 message: 'Query not found'
//             });
//         }
//         query.status='Resolved';
//         await query.save();
//         await mailSender(
//             query.email,
//             'Query Resolved - Industrial Goods',
//             `
//             <!DOCTYPE html>
//             <html lang="en">
//             <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <style>
//             body {
//             font-family: Arial, sans-serif;
//             line-height: 1.6;
//             }
//             .container {
//             max-width: 600px;
//             margin: 0 auto;
//             padding: 20px;
//             }
//             .header {
//             background: #1a73e8;
//             color: #fff;
//             padding: 20px;
//             }
//             .content {
//             padding: 20px;
//             border: 1px solid #ddd;
//             }
//             </style>
//             </head>
//             <body>
//             <div class="container">
//             <div class="header">
//             <h2>Query Resolved</h2>
//             </div>
//             <div class="content">
//             <p>Dear ${query.name},</p>
//             <p>Your query has been resolved.</p>
//             <p>Thank you for contacting us.</p>
//             <p>Best regards,<br>Industrial Goods Team</p>
//             </div>
//             </div>
//             </body>
//             </html>
//             `
//         );

//         res.json({
//             success: true,
//             message: 'Query resolved successfully'
//         });
//     }catch(err){
//         console.error('Error resolving query:',err);
//         res.status(500).json({
//             success: false,
//             message: 'Error resolving query'
//         });
//     }
// })
  



module.exports=router;